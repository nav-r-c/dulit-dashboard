import { useState } from 'react';
import { TextInput, Container, Title } from '@mantine/core';

function Speakers() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (term : string) => {
    setSearchTerm(term);
  };

  return (
    <Container>
      <Title order={2} mb="md">Speakers</Title>
      <TextInput
        placeholder="Search by speaker name or id"
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
        mb="lg"
      />
      {/* Here you can fetch and display speakers, filtering based on searchTerm */}
      <div>
        <p>List of speakers will be displayed here...</p>
      </div>
    </Container>
  );
}

export default Speakers;
