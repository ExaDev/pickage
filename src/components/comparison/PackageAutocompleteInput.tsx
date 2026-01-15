import { forwardRef } from "react";
import { ActionIcon, Autocomplete, Group } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useDebounce } from "@/hooks/useDebounce";
import { usePackageSearch } from "@/hooks/usePackageSearch";

const DEBOUNCE_DELAY = 300;

export interface PackageAutocompleteInputProps {
  index: number;
  value: string;
  searchQuery: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
  showRemove: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}

export const PackageAutocompleteInput = forwardRef<
  HTMLInputElement,
  PackageAutocompleteInputProps
>(({ index, value, searchQuery, onChange, onRemove, showRemove }, ref) => {
  // Debounce the search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);

  // Fetch search suggestions using the debounced query
  const { data: searchResults, isLoading } =
    usePackageSearch(debouncedSearchQuery);

  // Format search results for Autocomplete component
  // Use group format to store additional data for custom rendering
  const suggestions = (searchResults || []).slice(0, 8).map((result) => {
    const name = result.package.name;
    return {
      value: name,
      label: name,
      description: truncate(result.package.description, 60),
    };
  });

  return (
    <Group gap="md">
      <Autocomplete
        label={`Package ${String(index + 1)}`}
        placeholder="e.g., react"
        required
        value={value}
        onChange={(newValue) => {
          onChange(newValue);
        }}
        data={suggestions}
        limit={8}
        style={{ flex: 1 }}
        ref={ref}
        rightSection={isLoading ? <div style={{ width: 16 }} /> : undefined}
        // Custom option rendering to show description
        renderOption={({ option }) => {
          const description = (option as { description?: string }).description;
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
      {showRemove && onRemove && (
        <ActionIcon
          color="red"
          variant="subtle"
          onClick={onRemove}
          mt={index === 0 ? 23 : 0}
          size={36}
          aria-label={`Remove package ${String(index + 1)}`}
        >
          <IconX size={20} />
        </ActionIcon>
      )}
    </Group>
  );
});

PackageAutocompleteInput.displayName = "PackageAutocompleteInput";

/**
 * Truncate text to specified length and add ellipsis
 */
function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
