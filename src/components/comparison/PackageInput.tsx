import { useForm } from '@mantine/form';
import { Button, Group, Stack, TextInput, Title } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

interface PackageInputForm {
  package1: string;
  package2: string;
}

interface PackageInputProps {
  onCompare: (pkg1: string, pkg2: string) => void;
  loading?: boolean;
}

export function PackageInput({ onCompare, loading }: PackageInputProps) {
  const form = useForm<PackageInputForm>({
    initialValues: {
      package1: '',
      package2: '',
    },
    validate: {
      package1: (value) => (!value ? 'Package name is required' : null),
      package2: (value) => (!value ? 'Package name is required' : null),
    },
  });

  const handleSubmit = (values: PackageInputForm) => {
    onCompare(values.package1, values.package2);
  };

  return (
    <Stack gap="md">
      <Title order={2}>Compare npm Packages</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Package 1"
            placeholder="e.g., react"
            required
            {...form.getInputProps('package1')}
          />
          <TextInput
            label="Package 2"
            placeholder="e.g., preact"
            required
            {...form.getInputProps('package2')}
          />
          <Group justify="flex-end">
            <Button
              type="submit"
              leftSection={<IconSearch size={16} />}
              loading={loading}
            >
              Compare
            </Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}
