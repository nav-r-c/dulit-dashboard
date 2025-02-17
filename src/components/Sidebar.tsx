import { Text, NavLink, Stack, Box } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import {IconTicket, IconUser} from '@tabler/icons-react';

function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();

  const links = [
    { label: 'Programmes', path: '/programmes', icon: <IconTicket /> },
    { label: 'Speakers', path: '/speakers', icon: <IconUser /> },
  ];

  return (
    <Box
      p="md"
      style={{ backgroundColor: '#1c1c1f', minHeight: '100vh' }}
    >
      <Box mb="md">
        <Text c="white" size="xl" fw={700}>
          DU Lit 2025
        </Text>
        <Text c="white">
          Admin Dashboard
        </Text>
      </Box>
      <Box>
        <Stack gap="sm">
          {links.map((link, index) => (
            <NavLink 
                leftSection={link.icon}
                key={`${link.label}-${index}`} 
                label={link.label} 
                color='#2d2f38' 
                c='white'
                active={location.pathname === link.path}
                onClick={() => navigate(link.path)} 
                variant='filled'
                autoContrast 
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

export default Sidebar;
