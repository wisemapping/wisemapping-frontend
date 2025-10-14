/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import {
  AdminUser,
  AdminUsersResponse,
  AdminUsersParams,
  AdminMap,
  AdminMapsResponse,
  AdminMapsParams,
  AdminClientInterface,
  SystemInfo,
  SystemHealth,
} from '../admin-client';

class MockAdminClient implements AdminClientInterface {
  private adminUsers: AdminUser[] = [
    {
      id: 1,
      email: 'admin@wisemapping.com',
      firstname: 'Admin',
      lastname: 'User',
      fullName: 'Admin User',
      locale: 'en',
      creationDate: '2023-01-01T00:00:00Z',
      isActive: true,
      isSuspended: false,
      allowSendEmail: true,
      authenticationType: 'DATABASE',
      isAdmin: true,
    },
    {
      id: 2,
      email: 'user@wisemapping.com',
      firstname: 'Regular',
      lastname: 'User',
      fullName: 'Regular User',
      locale: 'en',
      creationDate: '2023-01-02T00:00:00Z',
      isActive: true,
      isSuspended: false,
      allowSendEmail: false,
      authenticationType: 'GOOGLE_OAUTH2',
      isAdmin: false,
    },
    {
      id: 3,
      email: 'john.doe@wisemapping.com',
      firstname: 'John',
      lastname: 'Doe',
      fullName: 'John Doe',
      locale: 'es',
      creationDate: '2023-01-03T00:00:00Z',
      isActive: true,
      isSuspended: false,
      allowSendEmail: true,
      authenticationType: 'DATABASE',
      isAdmin: false,
    },
    {
      id: 4,
      email: 'suspended@wisemapping.com',
      firstname: 'Suspended',
      lastname: 'User',
      fullName: 'Suspended User',
      locale: 'en',
      creationDate: '2023-01-04T00:00:00Z',
      isActive: false,
      isSuspended: true,
      allowSendEmail: false,
      authenticationType: 'DATABASE',
      isAdmin: false,
    },
    {
      id: 5,
      email: 'marketing@wisemapping.com',
      firstname: 'Marketing',
      lastname: 'Manager',
      fullName: 'Marketing Manager',
      locale: 'en',
      creationDate: '2023-02-01T00:00:00Z',
      isActive: true,
      isSuspended: false,
      allowSendEmail: true,
      authenticationType: 'DATABASE',
      isAdmin: false,
    },
    {
      id: 6,
      email: 'product@wisemapping.com',
      firstname: 'Product',
      lastname: 'Owner',
      fullName: 'Product Owner',
      locale: 'en',
      creationDate: '2023-02-15T00:00:00Z',
      isActive: true,
      isSuspended: false,
      allowSendEmail: true,
      authenticationType: 'GOOGLE_OAUTH2',
      isAdmin: false,
    },
    {
      id: 7,
      email: 'hr@wisemapping.com',
      firstname: 'HR',
      lastname: 'Specialist',
      fullName: 'HR Specialist',
      locale: 'fr',
      creationDate: '2023-03-01T00:00:00Z',
      isActive: true,
      isSuspended: false,
      allowSendEmail: false,
      authenticationType: 'DATABASE',
      isAdmin: false,
    },
    {
      id: 8,
      email: 'finance@wisemapping.com',
      firstname: 'Finance',
      lastname: 'Analyst',
      fullName: 'Finance Analyst',
      locale: 'en',
      creationDate: '2023-03-15T00:00:00Z',
      isActive: true,
      isSuspended: false,
      allowSendEmail: true,
      authenticationType: 'DATABASE',
      isAdmin: false,
    },
    {
      id: 9,
      email: 'support@wisemapping.com',
      firstname: 'Support',
      lastname: 'Agent',
      fullName: 'Support Agent',
      locale: 'de',
      creationDate: '2023-04-01T00:00:00Z',
      isActive: true,
      isSuspended: false,
      allowSendEmail: true,
      authenticationType: 'DATABASE',
      isAdmin: false,
    },
    {
      id: 10,
      email: 'tech@wisemapping.com',
      firstname: 'Technical',
      lastname: 'Lead',
      fullName: 'Technical Lead',
      locale: 'en',
      creationDate: '2023-04-15T00:00:00Z',
      isActive: true,
      isSuspended: false,
      allowSendEmail: true,
      authenticationType: 'GOOGLE_OAUTH2',
      isAdmin: false,
    },
    {
      id: 11,
      email: 'design@wisemapping.com',
      firstname: 'UI/UX',
      lastname: 'Designer',
      fullName: 'UI/UX Designer',
      locale: 'es',
      creationDate: '2023-05-01T00:00:00Z',
      isActive: true,
      isSuspended: false,
      allowSendEmail: false,
      authenticationType: 'DATABASE',
      isAdmin: false,
    },
    {
      id: 12,
      email: 'qa@wisemapping.com',
      firstname: 'QA',
      lastname: 'Engineer',
      fullName: 'QA Engineer',
      locale: 'en',
      creationDate: '2023-05-15T00:00:00Z',
      isActive: false,
      isSuspended: false,
      allowSendEmail: true,
      authenticationType: 'DATABASE',
      isAdmin: false,
    },
  ];

  private adminMaps: AdminMap[] = [
    {
      id: 1,
      title: 'Sample Mind Map',
      description: 'A sample mind map for demonstration purposes',
      createdBy: 'admin@wisemapping.com',
      createdById: 1,
      creationTime: '2023-01-01T10:00:00Z',
      lastModificationBy: 'admin@wisemapping.com',
      lastModificationById: 1,
      lastModificationTime: '2023-01-15T14:30:00Z',
      public: true,
      isLocked: false,
      starred: true,
      labels: ['Sample', 'Demo'],
      spam: false,
      isCreatorSuspended: false,
    },
    {
      id: 2,
      title: 'Private Project Map',
      description: 'Internal project planning mind map',
      createdBy: 'user@wisemapping.com',
      createdById: 2,
      creationTime: '2023-02-15T11:30:00Z',
      lastModificationBy: 'user@wisemapping.com',
      lastModificationById: 2,
      lastModificationTime: '2023-03-01T09:15:00Z',
      public: false,
      isLocked: false,
      starred: false,
      labels: ['Project', 'Private'],
      spam: false,
      isCreatorSuspended: false,
    },
    {
      id: 3,
      title: 'Locked Research Map',
      description: 'Research findings that are currently being edited',
      createdBy: 'john.doe@example.com',
      createdById: 3,
      creationTime: '2023-03-20T08:00:00Z',
      lastModificationBy: 'john.doe@example.com',
      lastModificationById: 3,
      lastModificationTime: '2023-04-10T16:45:00Z',
      public: false,
      isLocked: true,
      isLockedBy: 'john.doe@example.com',
      starred: false,
      labels: ['Research', 'Work-in-Progress'],
      spam: false,
      isCreatorSuspended: false,
    },
    {
      id: 4,
      title: 'Public Knowledge Base',
      description: 'Shared knowledge base available to everyone',
      createdBy: 'admin@wisemapping.com',
      createdById: 1,
      creationTime: '2023-04-10T14:00:00Z',
      lastModificationBy: 'admin@wisemapping.com',
      lastModificationById: 1,
      lastModificationTime: '2023-04-25T12:20:00Z',
      public: true,
      isLocked: false,
      starred: true,
      labels: ['Knowledge', 'Public', 'Reference'],
      spam: false,
      isCreatorSuspended: false,
    },
    {
      id: 5,
      title: 'Buy Cheap Products Now!',
      description: 'Get the best deals on amazing products. Call now!',
      createdBy: 'spammer@fake.com',
      createdById: 5,
      creationTime: '2023-05-01T12:00:00Z',
      lastModificationBy: 'spammer@fake.com',
      lastModificationById: 5,
      lastModificationTime: '2023-05-01T12:00:00Z',
      public: true,
      isLocked: false,
      starred: false,
      labels: [],
      spam: true,
      spamType: 'CONTACT_INFO',
      spamDetectedDate: '2023-05-01T12:05:00Z',
      spamDescription: 'Contains contact information and promotional content',
      isCreatorSuspended: true,
    },
    {
      id: 6,
      title: 'Marketing Strategy Map',
      description: 'Comprehensive marketing strategy for Q4',
      createdBy: 'marketing@wisemapping.com',
      createdById: 6,
      creationTime: '2023-06-01T09:00:00Z',
      lastModificationBy: 'marketing@wisemapping.com',
      lastModificationById: 6,
      lastModificationTime: '2023-06-15T14:20:00Z',
      public: false,
      isLocked: false,
      starred: false,
      labels: ['Marketing', 'Strategy'],
      spam: false,
      isCreatorSuspended: false,
    },
    {
      id: 7,
      title: 'Product Roadmap',
      description: 'Future product development roadmap',
      createdBy: 'product@wisemapping.com',
      createdById: 7,
      creationTime: '2023-06-10T10:30:00Z',
      lastModificationBy: 'product@wisemapping.com',
      lastModificationById: 7,
      lastModificationTime: '2023-06-25T16:45:00Z',
      public: false,
      isLocked: false,
      starred: true,
      labels: ['Product', 'Roadmap', 'Planning'],
      spam: false,
      isCreatorSuspended: false,
    },
    {
      id: 8,
      title: 'Team Organization',
      description: 'Company team structure and responsibilities',
      createdBy: 'hr@wisemapping.com',
      createdById: 8,
      creationTime: '2023-07-01T11:15:00Z',
      lastModificationBy: 'hr@wisemapping.com',
      lastModificationById: 8,
      lastModificationTime: '2023-07-10T13:30:00Z',
      public: false,
      isLocked: true,
      isLockedBy: 'hr@wisemapping.com',
      starred: false,
      labels: ['HR', 'Organization', 'Team'],
      spam: false,
      isCreatorSuspended: false,
    },
    {
      id: 9,
      title: 'Financial Planning',
      description: 'Annual financial planning and budgeting',
      createdBy: 'finance@wisemapping.com',
      createdById: 9,
      creationTime: '2023-07-15T08:45:00Z',
      lastModificationBy: 'finance@wisemapping.com',
      lastModificationById: 9,
      lastModificationTime: '2023-07-20T12:00:00Z',
      public: false,
      isLocked: false,
      starred: true,
      labels: ['Finance', 'Budget', 'Planning'],
      spam: false,
      isCreatorSuspended: false,
    },
    {
      id: 10,
      title: 'Customer Feedback Analysis',
      description: 'Analysis of customer feedback and satisfaction',
      createdBy: 'support@wisemapping.com',
      createdById: 10,
      creationTime: '2023-08-01T14:20:00Z',
      lastModificationBy: 'support@wisemapping.com',
      lastModificationById: 10,
      lastModificationTime: '2023-08-15T09:30:00Z',
      public: true,
      isLocked: false,
      starred: false,
      labels: ['Customer', 'Feedback', 'Analysis'],
      spam: false,
      isCreatorSuspended: false,
    },
    {
      id: 11,
      title: 'Technical Architecture',
      description: 'System architecture and technical specifications',
      createdBy: 'tech@wisemapping.com',
      createdById: 11,
      creationTime: '2023-08-10T16:00:00Z',
      lastModificationBy: 'tech@wisemapping.com',
      lastModificationById: 11,
      lastModificationTime: '2023-08-25T11:45:00Z',
      public: false,
      isLocked: false,
      starred: true,
      labels: ['Technical', 'Architecture', 'System'],
      spam: false,
      isCreatorSuspended: false,
    },
    {
      id: 12,
      title: 'Another Spam Map',
      description: 'Click here for amazing offers!',
      createdBy: 'spammer2@fake.com',
      createdById: 12,
      creationTime: '2023-09-01T12:00:00Z',
      lastModificationBy: 'spammer2@fake.com',
      lastModificationById: 12,
      lastModificationTime: '2023-09-01T12:00:00Z',
      public: true,
      isLocked: false,
      starred: false,
      labels: [],
      spam: true,
      spamType: 'KEYWORD_PATTERN',
      spamDetectedDate: '2023-09-01T12:10:00Z',
      spamDescription: 'Contains promotional keywords and patterns',
      isCreatorSuspended: true,
    },
  ];

  // Admin-specific methods with pagination
  getAdminUsers(params?: AdminUsersParams): Promise<AdminUsersResponse> {
    console.log('MockAdminClient: Returning paginated admin users', params);

    let filteredUsers = [...this.adminUsers];

    // Apply search filter
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.email.toLowerCase().includes(searchLower) ||
          user.firstname.toLowerCase().includes(searchLower) ||
          user.lastname.toLowerCase().includes(searchLower) ||
          user.fullName.toLowerCase().includes(searchLower),
      );
    }

    // Apply status filters
    if (params?.filterActive !== undefined) {
      filteredUsers = filteredUsers.filter((user) => user.isActive === params.filterActive);
    }

    if (params?.filterSuspended !== undefined) {
      filteredUsers = filteredUsers.filter((user) => user.isSuspended === params.filterSuspended);
    }

    // Apply auth type filter
    if (params?.filterAuthType) {
      filteredUsers = filteredUsers.filter(
        (user) => user.authenticationType === params.filterAuthType,
      );
    }

    // Apply sorting
    if (params?.sortBy) {
      filteredUsers.sort((a, b) => {
        const aVal = String((a as unknown as Record<string, unknown>)[params.sortBy!] || '');
        const bVal = String((b as unknown as Record<string, unknown>)[params.sortBy!] || '');
        const result = aVal.localeCompare(bVal);
        return params.sortOrder === 'desc' ? -result : result;
      });
    }

    // Pagination
    const page = (params?.page ?? 0) + 1; // Convert 0-based to 1-based for calculation
    const pageSize = params?.pageSize || 10;
    const totalCount = filteredUsers.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return Promise.resolve({
      data: paginatedUsers,
      page: params?.page ?? 0, // Return the original 0-based page
      pageSize,
      totalElements: totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    });
  }

  updateAdminUser(userId: number, userData: Partial<AdminUser>): Promise<AdminUser> {
    console.log('MockAdminClient: Updating user', userId, userData);

    const userIndex = this.adminUsers.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
      throw new Error(`User with id ${userId} not found`);
    }

    const updatedUser = {
      ...this.adminUsers[userIndex],
      ...userData,
      fullName: `${userData.firstname || this.adminUsers[userIndex].firstname} ${userData.lastname || this.adminUsers[userIndex].lastname}`,
    };

    this.adminUsers[userIndex] = updatedUser;
    return Promise.resolve(updatedUser);
  }

  createAdminUser(
    userData: Omit<AdminUser, 'id' | 'fullName'> & { password: string },
  ): Promise<AdminUser> {
    console.log('MockAdminClient: Creating user', userData);

    const newUser: AdminUser = {
      id: Math.max(...this.adminUsers.map((u) => u.id)) + 1,
      ...userData,
      fullName: `${userData.firstname} ${userData.lastname}`,
      isActive: true,
      isSuspended: false,
      authenticationType: 'DATABASE',
    };

    this.adminUsers.push(newUser);
    return Promise.resolve(newUser);
  }

  deleteAdminUser(userId: number): Promise<void> {
    console.log('MockAdminClient: Deleting user', userId);

    const userIndex = this.adminUsers.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
      throw new Error(`User with id ${userId} not found`);
    }

    this.adminUsers.splice(userIndex, 1);
    return Promise.resolve();
  }

  // Maps management methods
  getAdminMaps(params?: AdminMapsParams): Promise<AdminMapsResponse> {
    console.log('MockAdminClient: Returning paginated admin maps', params);

    let filteredMaps = [...this.adminMaps];

    // Apply search filter
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredMaps = filteredMaps.filter(
        (map) =>
          map.title.toLowerCase().includes(searchLower) ||
          map.description.toLowerCase().includes(searchLower) ||
          map.createdBy.toLowerCase().includes(searchLower),
      );
    }

    // Apply filters
    if (params?.filterPublic !== undefined) {
      filteredMaps = filteredMaps.filter((map) => map.public === params.filterPublic);
    }

    if (params?.filterLocked !== undefined) {
      filteredMaps = filteredMaps.filter((map) => map.isLocked === params.filterLocked);
    }

    if (params?.filterSpam !== undefined) {
      filteredMaps = filteredMaps.filter((map) => map.spam === params.filterSpam);
    }

    // Apply sorting
    if (params?.sortBy) {
      filteredMaps.sort((a, b) => {
        const aVal = String((a as unknown as Record<string, unknown>)[params.sortBy!] || '');
        const bVal = String((b as unknown as Record<string, unknown>)[params.sortBy!] || '');
        const result = aVal.localeCompare(bVal);
        return params.sortOrder === 'desc' ? -result : result;
      });
    }

    // Pagination
    const page = (params?.page ?? 0) + 1; // Convert 0-based to 1-based for calculation
    const pageSize = params?.pageSize || 10;
    const totalCount = filteredMaps.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedMaps = filteredMaps.slice(startIndex, endIndex);

    return Promise.resolve({
      data: paginatedMaps,
      page: params?.page ?? 0, // Return the original 0-based page
      pageSize,
      totalElements: totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    });
  }

  getUserMaps(userId: number): Promise<AdminMap[]> {
    console.log('MockAdminClient: Getting user maps for user', userId);

    // Find the user to get their email/name
    const user = this.adminUsers.find((u) => u.id === userId);
    if (!user) {
      return Promise.reject(new Error('User not found'));
    }

    // Return maps created by this user
    const userMaps = this.adminMaps.filter(
      (map) => map.createdBy === user.email || map.createdBy === user.fullName,
    );

    return Promise.resolve(userMaps);
  }

  updateAdminMap(mapId: number, mapData: Partial<AdminMap>): Promise<AdminMap> {
    console.log('MockAdminClient: Updating map', mapId, mapData);

    const mapIndex = this.adminMaps.findIndex((map) => map.id === mapId);
    if (mapIndex === -1) {
      return Promise.reject(new Error('Map not found'));
    }
    const updatedMap = { ...this.adminMaps[mapIndex], ...mapData };
    this.adminMaps[mapIndex] = updatedMap;
    return Promise.resolve(updatedMap);
  }

  updateMapSpamStatus(mapId: number, spamData: { spam: boolean }): Promise<AdminMap> {
    console.log('MockAdminClient: Updating map spam status', mapId, spamData);

    const mapIndex = this.adminMaps.findIndex((map) => map.id === mapId);
    if (mapIndex === -1) {
      return Promise.reject(new Error('Map not found'));
    }

    const updatedMap = {
      ...this.adminMaps[mapIndex],
      spam: spamData.spam,
      // Update spam-related fields when marking as spam
      ...(spamData.spam && {
        spamType: 'MANUAL',
        spamDetectedDate: new Date().toISOString(),
        spamDescription: 'Manually marked as spam by admin',
      }),
      // Clear spam fields when marking as not spam
      ...(!spamData.spam && {
        spamType: undefined,
        spamDetectedDate: undefined,
        spamDescription: undefined,
      }),
    };
    this.adminMaps[mapIndex] = updatedMap;
    return Promise.resolve(updatedMap);
  }

  deleteAdminMap(mapId: number): Promise<void> {
    console.log('MockAdminClient: Deleting map', mapId);
    const mapIndex = this.adminMaps.findIndex((map) => map.id === mapId);
    if (mapIndex === -1) {
      return Promise.reject(new Error('Map not found'));
    }

    this.adminMaps.splice(mapIndex, 1);
    return Promise.resolve();
  }

  getAdminMapXml(mapId: number): Promise<string> {
    console.log('MockAdminClient: Getting map XML', mapId);
    const map = this.adminMaps.find((map) => map.id === mapId);
    if (!map) {
      return Promise.reject(new Error('Map not found'));
    }

    // Generate mock XML content based on the map
    const mockXml = `<?xml version="1.0" encoding="UTF-8"?>
<map>
  <title>${map.title}</title>
  <description>${map.description}</description>
  <created-by>${map.createdBy}</created-by>
  <creation-time>${map.creationTime}</creation-time>
  <last-modification-by>${map.lastModificationBy}</last-modification-by>
  <last-modification-time>${map.lastModificationTime}</last-modification-time>
  <is-public>${map.public}</is-public>
  <is-locked>${map.isLocked}</is-locked>
  <labels>
    ${map.labels.map((label) => `<label>${label}</label>`).join('\n    ')}
  </labels>
  <content>
    <!-- Mock XML content for mindmap structure -->
    <topic id="root" text="${map.title}">
      <topic id="child1" text="Sample Topic 1">
        <topic id="child1-1" text="Sub Topic 1.1"/>
        <topic id="child1-2" text="Sub Topic 1.2"/>
      </topic>
      <topic id="child2" text="Sample Topic 2">
        <topic id="child2-1" text="Sub Topic 2.1"/>
      </topic>
    </topic>
  </content>
</map>`;

    return Promise.resolve(mockXml);
  }

  getSystemInfo(): Promise<SystemInfo> {
    console.log('MockAdminClient: Getting system info');
    return Promise.resolve({
      application: {
        name: 'WiseMapping API (Mock)',
        port: '8080',
      },
      database: {
        driver: 'org.hsqldb.jdbc.JDBCDriver',
        url: 'jdbc:hsqldb:mem:wisemapping;sql.names=false;sql.regular_names=false',
        username: 'sa',
        hibernateDdlAuto: 'none',
      },
      jvm: {
        javaVersion: '17.0.2',
        javaVendor: 'Eclipse Adoptium',
        uptime: 3600000, // 1 hour in milliseconds
        startTime: Date.now() - 3600000,
        maxMemory: 2147483648, // 2GB
        usedMemory: 1073741824, // 1GB
        totalMemory: 1610612736, // 1.5GB
        availableProcessors: 8,
        systemLoadAverage: 0.5,
      },
      statistics: {
        totalUsers: this.adminUsers.length,
        totalMindmaps: this.adminMaps.length,
      },
    });
  }

  getSystemHealth(): Promise<SystemHealth> {
    console.log('MockAdminClient: Getting system health');
    return Promise.resolve({
      database: 'UP',
      memory: 'UP',
      memoryUsagePercent: 50.0,
    });
  }

  updateUserSuspension(
    userId: number,
    suspensionData: { suspended: boolean; suspensionReason?: string },
  ): Promise<AdminUser> {
    console.log(`MockAdminClient: Updating suspension for user ${userId}`, suspensionData);
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.adminUsers.find((u) => u.id === userId);
        if (user) {
          user.isSuspended = suspensionData.suspended;
          if (suspensionData.suspended && suspensionData.suspensionReason) {
            (
              user as AdminUser & { suspensionReason?: string; suspendedDate?: string }
            ).suspensionReason = suspensionData.suspensionReason;
            (
              user as AdminUser & { suspensionReason?: string; suspendedDate?: string }
            ).suspendedDate = new Date().toISOString();
          } else if (!suspensionData.suspended) {
            (
              user as AdminUser & { suspensionReason?: string; suspendedDate?: string }
            ).suspensionReason = undefined;
            (
              user as AdminUser & { suspensionReason?: string; suspendedDate?: string }
            ).suspendedDate = undefined;
          }
          resolve({ ...user });
        } else {
          throw new Error(`User with ID ${userId} not found`);
        }
      }, 500);
    });
  }

  suspendAdminUser(userId: number): Promise<AdminUser> {
    console.log(`MockAdminClient: Suspending user ${userId}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.adminUsers.find((u) => u.id === userId);
        if (user) {
          user.isSuspended = true;
          resolve({ ...user });
        } else {
          throw new Error(`User with ID ${userId} not found`);
        }
      }, 500);
    });
  }

  unsuspendAdminUser(userId: number): Promise<AdminUser> {
    console.log(`MockAdminClient: Unsuspending user ${userId}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.adminUsers.find((u) => u.id === userId);
        if (user) {
          user.isSuspended = false;
          resolve({ ...user });
        } else {
          throw new Error(`User with ID ${userId} not found`);
        }
      }, 500);
    });
  }

  activateAdminUser(userId: number): Promise<void> {
    console.log(`MockAdminClient: Activating user ${userId}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.adminUsers.find((u) => u.id === userId);
        if (user) {
          user.isActive = true;
          resolve();
        } else {
          throw new Error(`User with ID ${userId} not found`);
        }
      }, 500);
    });
  }
}

export default MockAdminClient;
