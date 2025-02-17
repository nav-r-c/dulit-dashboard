import { useEffect, useState } from 'react';
import { TextInput, Container, Title, Button, Modal, MultiSelect, Card, Image, Text, Group, Loader } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../apiClient';
import { useDisclosure } from '@mantine/hooks';
import { z } from 'zod';
import { useForm, zodResolver } from '@mantine/form';
import { fetchProgrammes } from '../request/programme-query';
import { fetchSpeakers, createSpeaker, updateSpeaker, deleteSpeaker } from '../request/speaker-query';

// Zod schema for speaker validation
const speakerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().min(1, "Bio is required"),
  programmes: z.array(z.string()).min(1, "At least one programme is required"),
  imageUrl: z.string().url().optional(),
});

export default function Speakers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<any | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  const queryClient = useQueryClient();
  
  // Corrected useQuery with the new signature (using queryKey and queryFn)
  const { data: speakers, isPending  } = useQuery({
    queryKey: ['speakers'],
    queryFn: fetchSpeakers,
  });

  const { data: programmesFetched } = useQuery({
    queryKey: ["programmes"],
    queryFn: fetchProgrammes,
  });

  const programmesList = programmesFetched?.map((programme: any) => {
    return `Day ${programme.day_number} - ${programme.name}`;
  });

  useEffect(() => {
    console.log("Programmes List=>", programmesList);
  }, [programmesList]);

  // Modal controls
  const [openedCreate, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [openedEdit, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [openedDelete, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  // Initialize useForm hook with Zod schema validation
  const form = useForm({
    validate: zodResolver(speakerSchema),
    initialValues: {
      name: '',
      bio: '',
      programmes: [],
      imageUrl: '',
    },
  });

  // Handle search input
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  // Handle image upload
  const handleImageUpload = async (event: any) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    // Send the image to your Flask server for imgBB upload
    const response = await apiClient.post('/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.status === 200) {
      setImageUrl(response.data.url); // Set the image URL returned by Flask server
    } else {
      alert('Image upload failed');
    }
  };

  // Handle create speaker mutation
  const createMutation = useMutation({
    mutationFn: createSpeaker,
    mutationKey: ['create-speaker'], 
    onSuccess: () => {
      queryClient.invalidateQueries(['speakers']);
      closeCreate();
    },
  });

  // Handle update speaker mutation
  const updateMutation = useMutation({
    mutationFn: updateSpeaker,
    mutationKey: ['update-speaker'], 
    onSuccess: () => {
      queryClient.invalidateQueries(['speakers']);
      closeEdit();
    },
  });

  // Handle delete speaker mutation
  const deleteMutation = useMutation({
    mutationFn: deleteSpeaker,
    mutationKey: ['delete-speaker'], 
    onSuccess: () => {
      queryClient.invalidateQueries(['speakers']);
      closeDelete();
    },
  });

  // Handle modal open and close for create
  const openCreateSpeaker = () => {
    form.reset();
    setImageUrl('');
    openCreate();
  };

  // Handle modal open and close for edit
  const openEditSpeaker = (speaker: any) => {
    setSelectedSpeaker(speaker);
    form.setValues({
      name: speaker.name,
      bio: speaker.bio,
      programmes: speaker.programmes.map((prog: any) => prog.toString()), // Assuming programmes are ObjectIds
      imageUrl: speaker.imageUrl,
    });
    openEdit();
  };

  // Handle modal open and close for delete
  const openDeleteSpeaker = (speakerId: any) => {
    setSelectedSpeaker({ id: speakerId });
    openDelete();
  };

  return (
    <Container>
      <Title order={2} mb="md">Speakers</Title>

      {/* Search Input */}
      <TextInput
        placeholder="Search by speaker name or id"
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
        mb="lg"
      />

      {/* Add New Speaker Button */}
      <Button onClick={openCreateSpeaker} mb="md">Add New Speaker</Button>

      {/* Speakers List */}
      {isPending ? (
        <Loader />
      ) : (
        speakers
          .filter((speaker: any) => speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) || speaker.id.includes(searchTerm))
          .map((speaker: any, index: number) => (
            <Card key={speaker.id} shadow="sm" padding="lg" mb="md">
              <Group justify="apart">
                <Image src={speaker.imageUrl} alt={speaker.name} width={100} height={100} />
                <Text>{`Day ${index + 1} - ${speaker.name}`}</Text>
                <Button onClick={() => openEditSpeaker(speaker)}>Edit</Button>
                <Button color="red" onClick={() => openDeleteSpeaker(speaker.id)}>Delete</Button>
              </Group>
            </Card>
          ))
      )}

      {/* Create Speaker Modal */}
      <Modal opened={openedCreate} onClose={closeCreate} title="Create New Speaker">
        <form onSubmit={form.onSubmit((values) => createMutation.mutate(values))}>
          <TextInput label="Name" {...form.getInputProps('name')} mb="md" />
          <TextInput label="Bio" {...form.getInputProps('bio')} mb="md" />
          <MultiSelect
            label="Programmes"
            data={programmesList}
            {...form.getInputProps('programmes')}
            mb="md"
          />
          <input type="file" onChange={handleImageUpload} />
          {imageUrl && <Image src={imageUrl} alt="Image preview" width={100} height={100} />}
          <Button type="submit" loading={createMutation.isPending}>
            Create Speaker
          </Button>
        </form>
      </Modal>

      {/* Edit Speaker Modal */}
      <Modal opened={openedEdit} onClose={closeEdit} title="Edit Speaker">
        <form onSubmit={form.onSubmit((values) => updateMutation.mutate(selectedSpeaker?.id, values))}>
          <TextInput label="Name" {...form.getInputProps('name')} mb="md" />
          <TextInput label="Bio" {...form.getInputProps('bio')} mb="md" />
          <MultiSelect
            label="Programmes"
            data={programmesList}
            {...form.getInputProps('programmes')}
            mb="md"
          />
          <input type="file" onChange={handleImageUpload} />
          {imageUrl && <Image src={imageUrl} alt="Image preview" width={100} height={100} />}
          <Button type="submit" loading={updateMutation.isPending}>
            Update Speaker
          </Button>
        </form>
      </Modal>

      {/* Delete Speaker Confirmation Modal */}
      <Modal opened={openedDelete} onClose={closeDelete} title="Delete Speaker">
        <Text>Are you sure you want to delete this speaker?</Text>
        <Button color="red" onClick={() => deleteMutation.mutate(selectedSpeaker?.id)} loading={deleteMutation.isPending}>
          Delete
        </Button>
      </Modal>
    </Container>
  );
}
