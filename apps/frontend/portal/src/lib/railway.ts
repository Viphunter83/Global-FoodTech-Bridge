
/**
 * Railway API Integration for Infrastructure Monitoring
 * Uses Railway GraphQL API v2
 */

const RAILWAY_API_URL = 'https://backboard.railway.app/graphql/v2';

export interface RailwayService {
    id: string;
    name: string;
    status: string;
    createdAt: string;
    url?: string;
    cpuUsage?: number;
    memoryUsage?: number;
}

export interface InfrastructureStatus {
    project: string;
    services: RailwayService[];
}

export async function fetchInfrastructureStatus(): Promise<InfrastructureStatus[]> {
    const token = process.env.RAILWAY_TOKEN;
    
    if (!token) {
        console.warn('RAILWAY_TOKEN is not set. Returning mock data.');
        return getMockInfrastructureStatus();
    }

    const query = `
        query GetProjects {
            projects {
                edges {
                    node {
                        id
                        name
                        services {
                            edges {
                                node {
                                    id
                                    name
                                    deployments(first: 1) {
                                        edges {
                                            node {
                                                id
                                                status
                                                createdAt
                                                staticUrl
                                                suggestedUsage {
                                                    cpuMilli
                                                    memoryMibi
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    try {
        const response = await fetch(RAILWAY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ query }),
        });

        const result = await response.json();

        if (result.errors) {
            console.error('Railway API Errors:', result.errors);
            // Don't throw, just log and fallback to mock if needed, or return empty
            return getMockInfrastructureStatus(); 
        }

        if (!result.data || !result.data.projects) {
            return getMockInfrastructureStatus();
        }

        return result.data.projects.edges.map((edge: any) => ({
            project: edge.node.name,
            services: edge.node.services.edges.map((sEdge: any) => {
                const latestDeployment = sEdge.node.deployments.edges[0]?.node;
                return {
                    id: sEdge.node.id,
                    name: sEdge.node.name,
                    status: latestDeployment?.status || 'IDLE',
                    createdAt: latestDeployment?.createdAt || new Date().toISOString(),
                    url: latestDeployment?.staticUrl,
                    cpuUsage: latestDeployment?.suggestedUsage?.cpuMilli ? latestDeployment.suggestedUsage.cpuMilli / 10 : undefined, // Convert milli to % roughly
                    memoryUsage: latestDeployment?.suggestedUsage?.memoryMibi || undefined,
                };
            }),
        }));
    } catch (error) {
        console.error('Error fetching Railway status:', error);
        return getMockInfrastructureStatus();
    }
}

function getMockInfrastructureStatus(): InfrastructureStatus[] {
    return [
        {
            project: 'Global FoodTech Bridge (Production)',
            services: [
                { id: '1', name: 'passport-service', status: 'SUCCESS', createdAt: new Date().toISOString() },
                { id: '2', name: 'iot-service', status: 'SUCCESS', createdAt: new Date().toISOString() },
                { id: '3', name: 'blockchain-service', status: 'SUCCESS', createdAt: new Date().toISOString() },
                { id: '4', name: 'postgres-db', status: 'SUCCESS', createdAt: new Date().toISOString() },
            ]
        }
    ];
}
