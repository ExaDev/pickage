import { useState, useEffect, useRef } from "react";
import {
  ActionIcon,
  Autocomplete,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Menu,
  Paper,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useClickOutside, useMediaQuery } from "@mantine/hooks";
import {
  IconCheck,
  IconLayoutColumns,
  IconLayoutGrid,
  IconLayoutList,
  IconMenu2,
  IconPlus,
  IconSearch,
  IconTable,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useDebounce } from "@/hooks/useDebounce";
import { usePackageSearch } from "@/hooks/usePackageSearch";
import { ImportDependenciesModal } from "./ImportDependenciesModal";
import type { ViewMode } from "@/types/views";

const MOBILE_BREAKPOINT = 768;

const DEBOUNCE_DELAY = 300;

interface StickyInputBarProps {
  packages: string[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onClear: () => void;
  onAddPackage: (name: string) => void;
}

export function StickyInputBar({
  packages,
  viewMode,
  onViewModeChange,
  onClear,
  onAddPackage,
}: StickyInputBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const isMobile = useMediaQuery(`(max-width: ${String(MOBILE_BREAKPOINT)}px)`);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close search when clicking outside on mobile
  useClickOutside(
    () => {
      if (isMobile && isSearchExpanded && !inputValue) {
        setIsSearchExpanded(false);
      }
    },
    null,
    [searchRef.current],
  );

  // Debounce the search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(inputValue, DEBOUNCE_DELAY);

  // Fetch search suggestions using the debounced query
  const { data: searchResults, isLoading } =
    usePackageSearch(debouncedSearchQuery);

  // Format search results for Autocomplete component
  const suggestions = (searchResults || []).slice(0, 8).map((result) => ({
    value: result.package.name,
    label: result.package.name,
    description: truncate(result.package.description, 60),
  }));

  useEffect(() => {
    const handler = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handler);
    return () => {
      window.removeEventListener("scroll", handler);
    };
  }, []);

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAddPackage(inputValue.trim());
      setInputValue("");
      if (isMobile) {
        setIsSearchExpanded(false);
      }
    }
  };

  const handleOptionSubmit = (selectedValue: string) => {
    onAddPackage(selectedValue);
    // Use setTimeout to clear after Mantine's internal onChange fires
    setTimeout(() => {
      setInputValue("");
      if (isMobile) {
        setIsSearchExpanded(false);
      }
    }, 0);
  };

  const handleExpandSearch = () => {
    setIsSearchExpanded(true);
    // Focus input after expanding
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleCollapseSearch = () => {
    setInputValue("");
    setIsSearchExpanded(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue.trim()) {
      event.preventDefault();
      handleAdd();
    }
  };

  const handleSearchBlur = () => {
    // Collapse search on blur if input is empty or whitespace-only (mobile only)
    if (isMobile && !inputValue.trim()) {
      // Small delay to allow click events on buttons to fire first
      setTimeout(() => {
        setInputValue("");
        setIsSearchExpanded(false);
      }, 150);
    }
  };

  const handleImportPackages = (importedPackages: string[]) => {
    // Add each imported package
    for (const pkg of importedPackages) {
      onAddPackage(pkg);
    }
  };

  return (
    <Paper
      shadow={isScrolled ? "md" : "none"}
      px={isMobile ? "xs" : "md"}
      py="xs"
      bg="var(--mantine-primary-color-light)"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: isScrolled
          ? "1px solid var(--mantine-color-default-border)"
          : "none",
        transition: "all 0.2s",
      }}
    >
      <Box px={isMobile ? "xs" : "md"}>
        <Group
          justify="space-between"
          wrap="nowrap"
          gap={isMobile ? "xs" : "md"}
          style={{ minHeight: 36 }}
        >
          <Group
            gap={isMobile ? "xs" : "md"}
            wrap="nowrap"
            style={{ flex: 1, minWidth: 0 }}
          >
            {/* Mobile: Show title when search is collapsed, hide when expanded */}
            {isMobile && !isSearchExpanded && (
              <Group gap={6} wrap="nowrap">
                <Title order={4} style={{ whiteSpace: "nowrap" }}>
                  Pickage
                </Title>
                <Text size="xs" c="dimmed">
                  v{__APP_VERSION__}
                </Text>
              </Group>
            )}

            {/* Desktop: Always show title */}
            {!isMobile && (
              <Group gap={6} wrap="nowrap">
                <Title order={4} style={{ whiteSpace: "nowrap" }}>
                  Pickage
                </Title>
                <Text size="xs" c="dimmed">
                  v{__APP_VERSION__}
                </Text>
              </Group>
            )}

            {/* Mobile: Search icon when collapsed */}
            {isMobile && !isSearchExpanded && (
              <Tooltip label="Search packages">
                <ActionIcon
                  color="brand"
                  variant="subtle"
                  size="md"
                  onClick={handleExpandSearch}
                  aria-label="Open search"
                >
                  <IconSearch size={20} />
                </ActionIcon>
              </Tooltip>
            )}

            {/* Mobile: Expanded search bar */}
            {isMobile && isSearchExpanded && (
              <Group
                ref={searchRef}
                gap="xs"
                wrap="nowrap"
                style={{ flex: 1, minWidth: 0 }}
              >
                <Autocomplete
                  ref={inputRef}
                  placeholder="Search packages..."
                  value={inputValue}
                  onChange={setInputValue}
                  onOptionSubmit={handleOptionSubmit}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSearchBlur}
                  data={suggestions}
                  limit={8}
                  size="sm"
                  style={{ flex: 1 }}
                  rightSection={
                    isLoading ? <div style={{ width: 16 }} /> : null
                  }
                  renderOption={({ option }) => {
                    const description = (option as { description?: string })
                      .description;
                    return (
                      <div>
                        <div style={{ fontWeight: 500 }}>{option.value}</div>
                        {typeof description === "string" && (
                          <div style={{ fontSize: "0.85em", opacity: 0.7 }}>
                            {description}
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                <Tooltip label="Add package">
                  <ActionIcon
                    color="brand"
                    variant="filled"
                    size="sm"
                    onClick={handleAdd}
                    disabled={!inputValue.trim()}
                    aria-label="Add package"
                  >
                    <IconPlus size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Import dependencies">
                  <ActionIcon
                    color="brand"
                    variant="light"
                    size="sm"
                    onClick={() => {
                      setIsImportModalOpen(true);
                    }}
                    aria-label="Import dependencies"
                  >
                    <IconUpload size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Close search">
                  <ActionIcon
                    color="gray"
                    variant="subtle"
                    size="sm"
                    onClick={handleCollapseSearch}
                    aria-label="Close search"
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            )}

            {/* Desktop: Always show search input */}
            {!isMobile && (
              <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                <Autocomplete
                  placeholder="Search packages..."
                  value={inputValue}
                  onChange={setInputValue}
                  onOptionSubmit={handleOptionSubmit}
                  onKeyDown={handleKeyDown}
                  data={suggestions}
                  limit={8}
                  style={{ flex: 1, minWidth: 200 }}
                  rightSection={
                    isLoading ? <div style={{ width: 16 }} /> : null
                  }
                  renderOption={({ option }) => {
                    const description = (option as { description?: string })
                      .description;
                    return (
                      <div>
                        <div style={{ fontWeight: 500 }}>{option.value}</div>
                        {typeof description === "string" && (
                          <div style={{ fontSize: "0.85em", opacity: 0.7 }}>
                            {description}
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                <Tooltip label="Add package to comparison">
                  <ActionIcon
                    color="brand"
                    variant="filled"
                    size="lg"
                    onClick={handleAdd}
                    disabled={!inputValue.trim()}
                    aria-label="Add package"
                  >
                    <IconPlus size={20} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Import from dependency file">
                  <ActionIcon
                    color="brand"
                    variant="light"
                    size="lg"
                    onClick={() => {
                      setIsImportModalOpen(true);
                    }}
                    aria-label="Import dependencies"
                  >
                    <IconUpload size={20} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            )}

            {/* Package badges - hide on mobile */}
            {!isMobile && packages.length > 0 && (
              <Group gap={4} wrap="wrap">
                {packages.map((pkg, index) => (
                  <Badge
                    key={`${pkg}-${String(index)}`}
                    variant="light"
                    color="brand"
                  >
                    {pkg}
                  </Badge>
                ))}
              </Group>
            )}
          </Group>

          {/* Controls - hamburger menu on mobile, inline on desktop */}
          {packages.length > 0 &&
            (isMobile ? (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="brand" size="md">
                    <IconMenu2 size={20} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>View Mode</Menu.Label>
                  <Menu.Item
                    leftSection={<IconLayoutColumns size={16} />}
                    rightSection={
                      viewMode === "carousel" ? <IconCheck size={14} /> : null
                    }
                    onClick={() => {
                      onViewModeChange("carousel");
                    }}
                  >
                    Carousel
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconLayoutGrid size={16} />}
                    rightSection={
                      viewMode === "grid" ? <IconCheck size={14} /> : null
                    }
                    onClick={() => {
                      onViewModeChange("grid");
                    }}
                  >
                    Grid
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconLayoutList size={16} />}
                    rightSection={
                      viewMode === "list" ? <IconCheck size={14} /> : null
                    }
                    onClick={() => {
                      onViewModeChange("list");
                    }}
                  >
                    List
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconTable size={16} />}
                    rightSection={
                      viewMode === "table" ? <IconCheck size={14} /> : null
                    }
                    onClick={() => {
                      onViewModeChange("table");
                    }}
                  >
                    Table
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item
                    leftSection={<IconUpload size={16} />}
                    onClick={() => {
                      setIsImportModalOpen(true);
                    }}
                  >
                    Import Dependencies
                  </Menu.Item>

                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={onClear}
                  >
                    Clear All
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Group gap="xs" wrap="nowrap">
                {/* View mode selector */}
                <Group gap={4} wrap="nowrap">
                  <Tooltip label="Carousel view">
                    <ActionIcon
                      variant={viewMode === "carousel" ? "filled" : "subtle"}
                      color="brand"
                      size="sm"
                      onClick={() => {
                        onViewModeChange("carousel");
                      }}
                      aria-label="Carousel view"
                    >
                      <IconLayoutColumns size={18} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Grid view">
                    <ActionIcon
                      variant={viewMode === "grid" ? "filled" : "subtle"}
                      color="brand"
                      size="sm"
                      onClick={() => {
                        onViewModeChange("grid");
                      }}
                      aria-label="Grid view"
                    >
                      <IconLayoutGrid size={18} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="List view">
                    <ActionIcon
                      variant={viewMode === "list" ? "filled" : "subtle"}
                      color="brand"
                      size="sm"
                      onClick={() => {
                        onViewModeChange("list");
                      }}
                      aria-label="List view"
                    >
                      <IconLayoutList size={18} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Table view">
                    <ActionIcon
                      variant={viewMode === "table" ? "filled" : "subtle"}
                      color="brand"
                      size="sm"
                      onClick={() => {
                        onViewModeChange("table");
                      }}
                      aria-label="Table view"
                    >
                      <IconTable size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <Divider orientation="vertical" />
                <Button variant="light" size="sm" onClick={onClear}>
                  Clear
                </Button>
              </Group>
            ))}
        </Group>
      </Box>

      <ImportDependenciesModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
        }}
        onImport={handleImportPackages}
      />
    </Paper>
  );
}

/**
 * Truncate text to specified length and add ellipsis
 */
function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
