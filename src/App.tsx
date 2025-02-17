import { AppShell } from '@mantine/core';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Programmes from './pages/Programmes';
import Speakers from './pages/Speakers';

function App() {


  return (
    <AppShell
      navbar={{
        width: 300,
        breakpoint: 'sm',
      }}
      padding="md"
    >
      <AppShell.Navbar><Sidebar /></AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Programmes />} />
          <Route path="/programmes" element={<Programmes />} />
          <Route path="/speakers" element={<Speakers />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
