import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { PackageAutocompleteInput } from "./PackageAutocompleteInput";

const MAX_PACKAGES = 6;
const MIN_PACKAGES = 2;

export interface PackageInputHandle {
  focus: () => void;
}

interface PackageInputProps {
  onCompare: (packageNames: string[]) => void;
  loading?: boolean;
}

interface PackageSearchState {
  value: string;
  searchQuery: string;
}

export const PackageInput = forwardRef<PackageInputHandle, PackageInputProps>(
  ({ onCompare, loading }, ref) => {
    const firstInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        firstInputRef.current?.focus();
      },
    }));

    // Each input has both a value and a search query for autocomplete
    const [packages, setPackages] = useState<PackageSearchState[]>([
      { value: "", searchQuery: "" },
      { value: "", searchQuery: "" },
    ]);

    const handleAddPackage = () => {
      if (packages.length < MAX_PACKAGES) {
        setPackages([...packages, { value: "", searchQuery: "" }]);
      }
    };

    const handleRemovePackage = (index: number) => {
      if (packages.length > MIN_PACKAGES) {
        setPackages(packages.filter((_, i) => i !== index));
      }
    };

    const handlePackageChange = (index: number, value: string) => {
      const newPackages = [...packages];
      newPackages[index] = { ...newPackages[index], value, searchQuery: value };
      setPackages(newPackages);
    };

    const handleSubmit = () => {
      const validPackages = packages
        .map((p) => p.value)
        .filter((p) => p.trim().length > 0);

      if (validPackages.length < MIN_PACKAGES) {
        return;
      }

      const uniquePackages = Array.from(new Set(validPackages));
      if (uniquePackages.length !== validPackages.length) {
        return;
      }

      onCompare(uniquePackages);
    };

    const canAddMore = packages.length < MAX_PACKAGES;
    const hasEnoughValidPackages =
      packages.filter((p) => p.value.trim().length > 0).length >= MIN_PACKAGES;
    const hasDuplicates =
      new Set(packages.map((p) => p.value).filter((p) => p.trim().length > 0))
        .size !==
      packages.map((p) => p.value).filter((p) => p.trim().length > 0).length;

    return (
      <Stack gap="md">
        <Title order={2}>Compare npm Packages</Title>

        {packages.map((pkg, index) => (
          <PackageAutocompleteInput
            key={index}
            index={index}
            value={pkg.value}
            searchQuery={pkg.searchQuery}
            onChange={(value) => {
              handlePackageChange(index, value);
            }}
            onSubmit={() => {
              // Legacy component uses Compare button for submission
            }}
            onRemove={
              packages.length > MIN_PACKAGES
                ? () => {
                    handleRemovePackage(index);
                  }
                : undefined
            }
            showRemove={packages.length > MIN_PACKAGES}
            ref={index === 0 ? firstInputRef : undefined}
          />
        ))}

        {hasDuplicates && (
          <Text c="red" size="sm">
            Please enter unique package names
          </Text>
        )}

        <Group justify="space-between">
          {canAddMore && (
            <Button variant="light" onClick={handleAddPackage}>
              + Add Package
            </Button>
          )}
          <Button
            type="submit"
            leftSection={<IconSearch size={16} />}
            loading={loading}
            disabled={!hasEnoughValidPackages || hasDuplicates}
            onClick={handleSubmit}
          >
            Compare
          </Button>
        </Group>
      </Stack>
    );
  },
);

PackageInput.displayName = "PackageInput";
