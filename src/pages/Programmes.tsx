import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProgrammes, deleteProgramme, createProgramme, updateProgramme } from "../request/programme-query";
import {
  TextInput,
  Box,
  Title,
  Table,
  Group,
  ActionIcon,
  Modal,
  Button,
  Drawer,
  Stack,
  NumberInput,
} from "@mantine/core";
import { IconTrash, IconEdit, IconPlus, IconCheck, IconX } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useForm, zodResolver, UseFormReturnType } from "@mantine/form";
import { z } from "zod";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import dayjs from "dayjs";
import { notifications } from "@mantine/notifications";

interface ProgrammeType {
  _id: string,
  name: string,
  day_number: number,
  date: string,
  start_datetime: string,
  end_datetime: string,
  venue: string,
}

type ProgrammeValues = {
  name: string,
  day_number: number,
  date: Date,
  start_datetime: string,
  end_datetime: string,
  venue: string,
}

// Zod schema for validation
const programmeSchema = z.object({
  name: z.string().min(3, "Programme name must be at least 3 characters"),
  day_number: z.number().min(1, "Day number must be positive"),
  date: z.date(),
  start_datetime: z.string().min(1, "Start time is required"),
  end_datetime: z.string().min(1, "End time is required"),
  venue: z.string().min(2, "Venue must be at least 2 characters"),
});

function Programmes() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Manage modal and drawer states
  const [deleteModalOpen, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [createDrawerOpen, { open: openCreateDrawer, close: closeCreateDrawer }] = useDisclosure(false);
  const [editDrawerOpen, { open: openEditDrawer, close: closeEditDrawer }] = useDisclosure(false);

  const [selectedProgramme, setSelectedProgramme] = useState<ProgrammeType | null>(null);
  const [id, setId] = useState<string>('')

  const { data: programmes, isPending, error } = useQuery({
    queryKey: ["programmes"],
    queryFn: fetchProgrammes,
  });

  const createMutation = useMutation({
    mutationFn: createProgramme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programmes"] });
      notifications.show({
        title: "Successful!",
        message: 'New Programme Created!',
        color: 'green',
        icon: <IconCheck size={16} />
      })
      closeDeleteModal();
    },
    onError: () => 
      notifications.show({
        title: "Error",
        message: "Please try again later.",
        color: "red",
        icon: <IconX size={16} />,
      }),
  });

  const editMutation = useMutation({
    mutationFn: updateProgramme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programmes"] });
      notifications.show({
        title: "Successful!",
        message: 'Programme Deleted Successfully!',
        color: 'green',
        icon: <IconCheck size={16} />
      })
      closeDeleteModal();
    },
    onError: () => 
      notifications.show({
        title: "Error",
        message: "Please try again later.",
        color: "red",
        icon: <IconX size={16} />,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProgramme,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programmes"] });
  
      notifications.show({
        title: "Successful!",
        message: "Programme Deleted Successfully!",
        color: "green",
        icon: <IconCheck size={16} />,
      });
  
      closeDeleteModal(); // This should be separate
    },
    onError: () => 
      notifications.show({
        title: "Error",
        message: "Please try again later.",
        color: "red",
        icon: <IconX size={16} />,
      }),
  });
  

  // Unified form for both create and edit
  const form = useForm<ProgrammeValues>({
    validate: zodResolver(programmeSchema),
    initialValues: {
      name: "",
      day_number: 1,
      date: new Date(),
      start_datetime: "",
      end_datetime: "",
      venue: "",
    },
  });

  // Handle delete
  const handleDelete = () => {
    if (selectedProgramme?._id) {
      deleteMutation.mutate(selectedProgramme._id);
    }
  };

  // Open edit drawer with programme details
  const handleEdit = (programme: ProgrammeType) => {
    setId(programme._id)
    form.setValues({
      name: programme.name,
      day_number: programme.day_number,
      date: new Date(programme.date),
      start_datetime: dayjs(programme.start_datetime).format('HH:mm'),
      end_datetime: dayjs(programme.end_datetime).format('HH:mm'),
      venue: programme.venue,
    });
    setSelectedProgramme(programme);
    openEditDrawer();
  };

  // Handle form submission (for both Create & Edit)
  const handleSubmit = (values: any, isEdit = false) => {
    const selectedDate = dayjs(values.date, "DD-MM-YYYY").format('YYYY-MM-DD');
    const startDatetimeISO = dayjs(`${selectedDate} ${values.start_datetime}`, 'YYYY-MM-DD HH:mm').toISOString();
    const endDatetimeISO = dayjs(`${selectedDate} ${values.end_datetime}`, 'YYYY-MM-DD HH:mm').toISOString()

    const payload = {
      ...values,
      start_datetime: startDatetimeISO,
      end_datetime: endDatetimeISO,
    };

    if (isEdit) {
      editMutation.mutate({ programmeId: id, programmeData: payload });
      closeEditDrawer();
    } else {
      createMutation.mutate(payload);
      closeCreateDrawer();
    }
    form.reset();
  };

  const filteredProgrammes = programmes?.filter(
    (programme : ProgrammeType) =>
      programme?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      programme?._id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  let content;

  if (isPending) {
    content = <p>Loading programmes...</p>;
  } else if (error) {
    content = <p>Error fetching programmes</p>;
  } else {
    content = (
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Start Time</Table.Th>
            <Table.Th>End Time</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredProgrammes?.map((programme : ProgrammeType) => (
            <Table.Tr key={programme._id}>
              <Table.Td>{programme._id}</Table.Td>
              <Table.Td>{programme.name}</Table.Td>
              <Table.Td>{dayjs(programme.date).format('DD-MM-YYYY')}</Table.Td>
              <Table.Td>{dayjs(programme.start_datetime).format('HH:mm')}</Table.Td>
              <Table.Td>{dayjs(programme.end_datetime).format('HH:mm')}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon color="blue" variant="light" onClick={() => handleEdit(programme)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => {
                      setSelectedProgramme(programme);
                      openDeleteModal();
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    );
  }

  return (
    <>
      <Box>
        <Title order={2} mb="md">Programmes</Title>
        <Group justify="space-between" mb="lg">
          <TextInput
            placeholder="Search by programme name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateDrawer}>
            Create New Programme
          </Button>
        </Group>
        {content}
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpen} onClose={closeDeleteModal} title="Confirm Deletion" centered>
        <p>Are you sure you want to delete this programme?</p>
        <Group mt="md" justify="right">
          <Button variant="default" onClick={closeDeleteModal} disabled={deleteMutation.isPending}>Cancel</Button>
          <Button color="red" onClick={handleDelete} loading={deleteMutation.isPending}>Delete</Button>
        </Group>
      </Modal>

      {/* Create Programme Drawer */}
      <Drawer opened={createDrawerOpen} onClose={closeCreateDrawer} title="Create Programme" padding="xl" size="md">
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <ProgrammeForm form={form} isPending={createMutation.isPending || editMutation.isPending} />
        </form>
      </Drawer>

      {/* Edit Programme Drawer */}
      <Drawer opened={editDrawerOpen} onClose={closeEditDrawer} title="Edit Programme" padding="xl" size="md" position="right">
        <form onSubmit={form.onSubmit((values) => handleSubmit(values, true))}>
          <ProgrammeForm form={form} isPending={createMutation.isPending || editMutation.isPending} />
        </form>
      </Drawer>
    </>
  );
}

const ProgrammeForm = ({ form, isPending } : { form: UseFormReturnType<ProgrammeValues>, isPending: boolean}) => (
  <Stack>
    <TextInput label="Programme Name" disabled={isPending} {...form.getInputProps("name")} />
    <NumberInput hideControls label="Day Number" disabled={isPending} {...form.getInputProps("day_number")} />
    <DatePickerInput label="Date" disabled={isPending} placeholder="Pick a date" {...form.getInputProps("date")} />
    <TimeInput label="Start Time" disabled={isPending} {...form.getInputProps("start_datetime")} />
    <TimeInput label="End Time" disabled={isPending} {...form.getInputProps("end_datetime")} />
    <TextInput label="Venue" disabled={isPending} {...form.getInputProps("venue")} />
    <Button type="submit" loading={isPending}>Save</Button>
  </Stack>
);

export default Programmes;
