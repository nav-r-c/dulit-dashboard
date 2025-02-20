import { useState } from 'react';
import { TextInput, Container, Title, Button, Modal, MultiSelect, Card, Image, Text, Group, Loader, FileInput, NumberInput } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../apiClient';
import { useDisclosure } from '@mantine/hooks';
import { z } from 'zod';
import { useForm, zodResolver } from '@mantine/form';
import { fetchProgrammes } from '../request/programme-query';
import { fetchSpeakers, createSpeaker, updateSpeaker, deleteSpeaker } from '../request/speaker-query';
import { notifications } from '@mantine/notifications';
import { IconX } from '@tabler/icons-react';

const speakerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().min(1, "Bio is required"),
  programmes: z.array(z.string()).min(1, "At least one programme is required"),
  imageUrl: z.string().url(),
  priority: z.number()
});

export default function Speakers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<any | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: speakers, isPending } = useQuery({
    queryKey: ['speakers'],
    queryFn: fetchSpeakers,
  });

  const { data: programmesFetched } = useQuery({
    queryKey: ['programmes'],
    queryFn: fetchProgrammes,
  });

  // Map fetched programmes to the format required by MultiSelect
  const programmesList = (programmesFetched || []).map((programme: any) => ({
    label: `Day ${programme.day_number} - ${programme.name}`,
    value: programme._id, // Ensure the value is the ID
  }));

  const [openedCreate, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [openedEdit, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [openedDelete, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  const form = useForm({
    validate: zodResolver(speakerSchema),
    initialValues: {
      name: '',
      bio: '',
      programmes: [] as string[], // This will store only the programme IDs
      imageUrl: '',
      priority: 0
    },
  });

  const handleImageUploadForUpdate = async (file: File | null) => {
    if (!file) return;
    setIsUploading(true);
  
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const response = await apiClient.post('/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      if (response.status === 200) {
        setImageUrl(response.data.url);
        form.setFieldValue('imageUrl', response.data.url); // Update the form state
      } else {
        notifications.show({
          title: "Error",
          message: "Please try again later.",
          color: "red",
          icon: <IconX size={16} />,
        });
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };
  

  const createMutation = useMutation({
    mutationFn: createSpeaker,
    mutationKey: ['create-speaker'],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers'] });
      closeCreate();
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSpeaker,
    mutationKey: ['update-speaker'],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers'] });
      closeEdit();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSpeaker,
    mutationKey: ['delete-speaker'],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['speakers'] });
      closeDelete();
    },
  });

  const openCreateSpeaker = () => {
    form.reset();
    setImageUrl('');
    openCreate();
  };

  const openEditSpeaker = (speaker: any) => {
    setSelectedSpeaker(speaker);
    form.setValues({
      name: speaker.name,
      bio: speaker.bio,
      programmes: speaker.programmes,
      imageUrl: speaker.imageUrl,
    });
    setImageUrl(speaker.imageUrl);
    openEdit();
  };

  const openDeleteSpeaker = (speakerId: any) => {
    setSelectedSpeaker({ _id: speakerId });
    openDelete();
  };

  console.log(form.errors)
  console.log(form.getValues())
  const handleSubmit = async (values: any) => {
    const selectedProgrammesIds = values.programmes.map((programme: any) => programme);
    createMutation.mutate({
      ...values,
      programmes: selectedProgrammesIds,
    });
  };

  const handleUpdateSpeaker = async (values: any) => {
    const { name, bio } = values;
    const selectedProgrammesIds = values.programmes.map((programme: any) => programme);
  
    const updatedData = {
      name,
      bio,
      programmes : selectedProgrammesIds,
      imageUrl: imageUrl || selectedSpeaker?.imageUrl, // Use the existing image URL if no new image
    };
  
    // Pass the correct speaker ID in the mutation
    updateMutation.mutate({
      speakerId: selectedSpeaker?._id,  // Ensure you're passing the correct speaker ID
      speakerData: updatedData
    });
    
  };
  

  return (
    <Container>
      <Title order={2} mb="md">Speakers</Title>

      <TextInput
        placeholder="Search by speaker name or id"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        mb="lg"
      />

      <Button onClick={openCreateSpeaker} mb="md">Add New Speaker</Button>

      {isPending ? (
        <Loader />
      ) : (
        speakers
          .filter((speaker: any) =>
            speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            speaker._id.includes(searchTerm)
          )
          .map((speaker: any) => (
            <Card key={speaker._id} shadow="sm" padding="lg" mb="md">
              <Group justify="apart">
                <Image src={speaker.imageUrl} alt={speaker.name} width={200} height={200} />
                <Text>{speaker.name}</Text>
                <Button onClick={() => openEditSpeaker(speaker)}>Edit</Button>
                <Button color="red" onClick={() => openDeleteSpeaker(speaker._id)}>Delete</Button>
              </Group>
            </Card>
          ))
      )}

      {/* Create Speaker Modal */}
      <Modal opened={openedCreate} onClose={closeCreate} title="Create New Speaker">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Name" {...form.getInputProps('name')} mb="md" />
          <TextInput label="Bio" {...form.getInputProps('bio')} mb="md" />
          <NumberInput description="Lower Priority means gets displayed first" hideControls label="Priority" {...form.getInputProps('priority')} mb="md" />
          <MultiSelect
            label="Programmes"
            data={programmesList || []}
            value={form.values.programmes}
            onChange={(value: string[]) => form.setFieldValue('programmes', value)}
            mb="md"
          />

          <FileInput label="Upload Image" accept="image/*" onChange={handleImageUploadForUpdate} mb="md" />
          {imageUrl && <Image src={imageUrl} alt="Preview" width={200} height={200} mb="md" />}

          <Button type="submit" loading={createMutation.isPending || isUploading}>
            Create Speaker
          </Button>
        </form>
      </Modal>

      {/* Edit Speaker Modal */}
      <Modal opened={openedEdit} onClose={closeEdit} title="Edit Speaker">
        <form onSubmit={form.onSubmit(handleUpdateSpeaker)}>
          <TextInput label="Name" {...form.getInputProps('name')} mb="md" />
          <TextInput label="Bio" {...form.getInputProps('bio')} mb="md" />
          <NumberInput description="Lower Priority means gets displayed first" hideControls label="Priority" {...form.getInputProps('priority')} mb="md" />
          <MultiSelect
            searchable
            label="Programmes"
            data={programmesList || []}  // Use synchronous data here
            value={form.values.programmes}
            onChange={(value) => form.setFieldValue('programmes', value)}
            mb="md"
          />
          

          <FileInput label="Upload New Image" accept="image/*" onChange={handleImageUploadForUpdate} mb="md" />
          {imageUrl && <Image src={imageUrl} alt="Preview" width={200} height={200} mb="md" />}

          <Button type="submit" loading={updateMutation.isPending || isUploading}>
            Update Speaker
          </Button>
        </form>
      </Modal>

      {/* Delete Speaker Modal */}
      <Modal opened={openedDelete} onClose={closeDelete} title="Delete Speaker">
        <Text>Are you sure you want to delete this speaker?</Text>
        <Button
          color="red"
          onClick={() => deleteMutation.mutate(selectedSpeaker?._id)}
          loading={deleteMutation.isPending}
        >
          Delete
        </Button>
      </Modal>
    </Container>
  );
}
