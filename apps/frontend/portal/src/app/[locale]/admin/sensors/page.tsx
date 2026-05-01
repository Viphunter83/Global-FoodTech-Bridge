import { getDevices } from '@/lib/api';
import { SensorsClient } from './SensorsClient';

export const metadata = {
    title: 'Sensor Fleet | GFTB Admin',
    description: 'Manage and monitor IoT sensor inventory.',
};

export default async function SensorsPage() {
    // Fetch initial data on the server
    // Note: On server-side, we don't have user token easily here 
    // unless we get it from cookies, but since this is an admin page, 
    // the backend will verify via x-api-key for internal requests.
    const initialSensors = await getDevices();

    return (
        <SensorsClient initialSensors={initialSensors} />
    );
}
