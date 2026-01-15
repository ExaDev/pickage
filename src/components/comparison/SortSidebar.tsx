import { ActionIcon, Box, Group, Text, Tooltip } from "@mantine/core";
import {
  IconArrowDown,
  IconArrowUp,
  IconGripVertical,
} from "@tabler/icons-react";
import type { SortCriterion, SortField } from "@/types/sort";
import { DEFAULT_SORT_DIRECTION } from "@/types/sort";

interface SortSidebarProps {
  sortCriteria: SortCriterion[];
  onSortChange: (criteria: SortCriterion[]) => void;
}

// Fields grouped by row (each on its own row for alignment)
// Row numbers based on GRID_ROWS structure in CarouselView:
// - header: rows 1-4
// - scores: rows 5-19 (overall=6, quality=7, popularity=8, maintenance=9)
// - comparison: row 20
// - npm: rows 21-30 (downloads=22, dependents=23)
// - github: rows 31-41 (stars=32, forks=33, issues=34)
const FIELDS_BY_ROW: Record<number, SortField[]> = {
  6: ["finalScore"],
  7: ["quality"],
  8: ["popularity"],
  9: ["maintenance"],
  22: ["weeklyDownloads"],
  23: ["dependentsCount"],
  32: ["stars"],
  33: ["forks"],
  34: ["openIssues"],
};

// Labels for display
const FIELD_LABELS: Record<SortField, string> = {
  finalScore: "Score",
  quality: "Quality",
  popularity: "Popular",
  maintenance: "Maint",
  weeklyDownloads: "Downloads",
  dependentsCount: "Dependents",
  stars: "Stars",
  forks: "Forks",
  openIssues: "Issues",
};

interface SortControlProps {
  field: SortField;
  sortCriteria: SortCriterion[];
  onSortChange: (criteria: SortCriterion[]) => void;
  compact?: boolean;
}

function SortControl({
  field,
  sortCriteria,
  onSortChange,
  compact = false,
}: SortControlProps) {
  const criterionIndex = sortCriteria.findIndex((c) => c.field === field);
  const criterion = criterionIndex >= 0 ? sortCriteria[criterionIndex] : null;
  const priority = criterionIndex >= 0 ? criterionIndex + 1 : null;

  const handleClick = () => {
    if (!criterion) {
      // Add to sort with default direction
      onSortChange([
        ...sortCriteria,
        { field, direction: DEFAULT_SORT_DIRECTION[field] },
      ]);
    } else if (criterion.direction === DEFAULT_SORT_DIRECTION[field]) {
      // Toggle direction
      const newCriteria = [...sortCriteria];
      newCriteria[criterionIndex] = {
        ...criterion,
        direction: criterion.direction === "asc" ? "desc" : "asc",
      };
      onSortChange(newCriteria);
    } else {
      // Remove from sort
      onSortChange(sortCriteria.filter((c) => c.field !== field));
    }
  };

  const isActive = criterion !== null;
  const direction = criterion?.direction;

  return (
    <Tooltip label={`Sort by ${FIELD_LABELS[field]}`} position="right">
      <ActionIcon
        variant={isActive ? "filled" : "subtle"}
        color={isActive ? "blue" : "gray"}
        size={compact ? "xs" : "sm"}
        onClick={handleClick}
        style={{ position: "relative" }}
      >
        {isActive ? (
          <>
            {direction === "desc" ? (
              <IconArrowDown size={compact ? 12 : 14} />
            ) : (
              <IconArrowUp size={compact ? 12 : 14} />
            )}
            {priority !== null && sortCriteria.length > 1 && (
              <Text
                size="8px"
                fw={700}
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  backgroundColor: "var(--mantine-color-blue-filled)",
                  color: "white",
                  borderRadius: "50%",
                  width: 12,
                  height: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {priority}
              </Text>
            )}
          </>
        ) : (
          <IconGripVertical size={compact ? 10 : 12} />
        )}
      </ActionIcon>
    </Tooltip>
  );
}

/**
 * Renders sort controls as direct grid children for perfect row alignment.
 * Each control is positioned in gridColumn 1 at its corresponding row.
 */
export function SortSidebar({
  sortCriteria,
  onSortChange,
}: SortSidebarProps): React.ReactNode[] {
  const elements: React.ReactNode[] = [];

  for (const [rowStr, fields] of Object.entries(FIELDS_BY_ROW)) {
    const row = parseInt(rowStr, 10);
    const isMultiField = fields.length > 1;

    elements.push(
      <Box
        key={`sort-${String(row)}`}
        style={{
          gridColumn: 1,
          gridRow: row,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "sticky",
          left: 0,
          backgroundColor: "var(--mantine-color-body)",
          zIndex: 10,
          width: 48,
        }}
      >
        <Group gap={2}>
          {fields.map((field) => (
            <SortControl
              key={field}
              field={field}
              sortCriteria={sortCriteria}
              onSortChange={onSortChange}
              compact={isMultiField}
            />
          ))}
        </Group>
      </Box>,
    );
  }

  return elements;
}
