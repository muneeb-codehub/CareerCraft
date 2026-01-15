// config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CareerCraft API Documentation',
            version: '1.0.0',
            description: `
                CareerCraft is an AI-powered career development platform that helps users with:
                - Resume building and ATS optimization
                - Skill gap analysis
                - Interview preparation
                - Career roadmap planning
                - Portfolio management
                
                ## Authentication
                Most endpoints require JWT authentication. Include the token in the Authorization header:
                \`Authorization: Bearer <your-jwt-token>\`
                
                ## Pagination
                History endpoints support pagination with query parameters:
                - \`page\`: Page number (default: 1)
                - \`limit\`: Items per page (default: 10, max: 100)
                - \`sort\`: Sort field (default: -createdAt)
                
                ## Rate Limiting
                API requests are rate-limited to prevent abuse.
            `,
            contact: {
                name: 'CareerCraft Support',
                email: 'muneebarif226@gmail.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            },
            {
                url: 'https://api.careercraft.com',
                description: 'Production server (placeholder)'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Error message'
                        },
                        error: {
                            type: 'string'
                        }
                    }
                },
                PaginationMeta: {
                    type: 'object',
                    properties: {
                        total: {
                            type: 'number',
                            description: 'Total number of items'
                        },
                        page: {
                            type: 'number',
                            description: 'Current page number'
                        },
                        limit: {
                            type: 'number',
                            description: 'Items per page'
                        },
                        totalPages: {
                            type: 'number',
                            description: 'Total number of pages'
                        },
                        hasNextPage: {
                            type: 'boolean'
                        },
                        hasPrevPage: {
                            type: 'boolean'
                        },
                        nextPage: {
                            type: 'number',
                            nullable: true
                        },
                        prevPage: {
                            type: 'number',
                            nullable: true
                        }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            example: '507f1f77bcf86cd799439011'
                        },
                        name: {
                            type: 'string',
                            example: 'John Doe'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john@example.com'
                        },
                        isAdmin: {
                            type: 'boolean',
                            default: false
                        },
                        isBlocked: {
                            type: 'boolean',
                            default: false
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                Resume: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string'
                        },
                        userId: {
                            type: 'string'
                        },
                        title: {
                            type: 'string'
                        },
                        content: {
                            type: 'string'
                        },
                        source: {
                            type: 'string',
                            enum: ['upload', 'form']
                        },
                        status: {
                            type: 'string',
                            enum: ['draft', 'submitted', 'reviewed', 'enhanced']
                        },
                        aiSuggestions: {
                            type: 'object',
                            properties: {
                                formatting: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    }
                                },
                                keywords: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    }
                                },
                                improvements: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    }
                                },
                                atsScore: {
                                    type: 'number',
                                    minimum: 0,
                                    maximum: 100
                                }
                            }
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                SkillGap: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string'
                        },
                        userId: {
                            type: 'string'
                        },
                        targetRole: {
                            type: 'string'
                        },
                        currentProfile: {
                            type: 'object',
                            properties: {
                                skills: {
                                    type: 'array',
                                    items: {
                                        type: 'string'
                                    }
                                },
                                experience: {
                                    type: 'string'
                                },
                                currentRole: {
                                    type: 'string'
                                }
                            }
                        },
                        analysis: {
                            type: 'object'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'completed', 'failed']
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                Interview: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string'
                        },
                        userId: {
                            type: 'string'
                        },
                        jobRole: {
                            type: 'string'
                        },
                        difficulty: {
                            type: 'string',
                            enum: ['easy', 'medium', 'hard']
                        },
                        questions: {
                            type: 'array',
                            items: {
                                type: 'object'
                            }
                        },
                        overallScore: {
                            type: 'number',
                            minimum: 0,
                            maximum: 100
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'in-progress', 'completed']
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                Roadmap: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string'
                        },
                        userId: {
                            type: 'string'
                        },
                        currentSkills: {
                            type: 'array',
                            items: {
                                type: 'string'
                            }
                        },
                        targetCareer: {
                            type: 'string'
                        },
                        milestones: {
                            type: 'array',
                            items: {
                                type: 'object'
                            }
                        },
                        progress: {
                            type: 'number',
                            minimum: 0,
                            maximum: 100
                        },
                        status: {
                            type: 'string',
                            enum: ['active', 'completed', 'abandoned']
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and authorization'
            },
            {
                name: 'Resume',
                description: 'Resume management and AI analysis'
            },
            {
                name: 'Skill Gap',
                description: 'Skill gap analysis endpoints'
            },
            {
                name: 'Interview',
                description: 'Interview simulation endpoints'
            },
            {
                name: 'Roadmap',
                description: 'Career roadmap generation'
            },
            {
                name: 'Portfolio',
                description: 'Portfolio management'
            },
            {
                name: 'User',
                description: 'User profile management'
            },
            {
                name: 'Admin',
                description: 'Admin-only endpoints'
            }
        ]
    },
    apis: ['./routes/*.js', './controllers/*.js'] // Path to API docs
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
    // Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'CareerCraft API Docs',
        customfavIcon: '/favicon.ico'
    }));

    // JSON spec
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    console.log('📚 Swagger documentation available at http://localhost:5000/api-docs');
};

export default swaggerSpec;
