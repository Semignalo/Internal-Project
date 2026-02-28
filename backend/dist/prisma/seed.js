"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.taskAssignee.deleteMany();
    await prisma.task.deleteMany();
    await prisma.division.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    const user1 = await prisma.user.create({
        data: { name: 'Sarah (Design)', email: 'sarah@starinc.com', password: 'password', role: 'MEMBER', workloadLevel: 'OVERLOADED' },
    });
    const user2 = await prisma.user.create({
        data: { name: 'Mike (Video Ed)', email: 'mike@starinc.com', password: 'password', role: 'MEMBER', workloadLevel: 'NORMAL' },
    });
    const user3 = await prisma.user.create({
        data: { name: 'Ayla (Copy)', email: 'ayla@starinc.com', password: 'password', role: 'MEMBER', workloadLevel: 'LOW' },
    });
    const user4 = await prisma.user.create({
        data: { name: 'Tom (Strategy)', email: 'tom@starinc.com', password: 'password', role: 'MEMBER', workloadLevel: 'NORMAL' },
    });
    const manager = await prisma.user.create({
        data: { name: 'Sam Johnson', email: 'sam@starinc.com', password: 'password', role: 'PROJECT_MANAGER' },
    });
    const project1 = await prisma.project.create({
        data: {
            name: 'Nike Summer Campaign',
            clientName: 'Nike Inc.',
            projectType: 'Campaign',
            startDate: new Date(),
            deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            status: 'PRODUCTION',
            overallProgress: 75,
            managerId: manager.id,
        }
    });
    const project2 = await prisma.project.create({
        data: {
            name: 'Oasis Rebranding',
            clientName: 'Oasis Beverages',
            projectType: 'Branding',
            startDate: new Date(),
            deadline: new Date(new Date().setDate(new Date().getDate() + 14)),
            status: 'REVISION',
            overallProgress: 45,
            managerId: manager.id,
        }
    });
    const project3 = await prisma.project.create({
        data: {
            name: 'Techcon 2026 Promo',
            clientName: 'Techcon Corp',
            projectType: 'Video Production',
            startDate: new Date(),
            deadline: new Date(new Date().setDate(new Date().getDate() + 7)),
            status: 'PLANNING',
            overallProgress: 15,
            managerId: manager.id,
        }
    });
    const div1 = await prisma.division.create({
        data: { name: 'Design', progressWeight: 100, projectId: project1.id }
    });
    await prisma.task.create({
        data: {
            title: 'Design Mockup',
            divisionId: div1.id,
            status: 'IN_PROGRESS',
            assignees: {
                create: [
                    { userId: user1.id }
                ]
            }
        }
    });
    console.log('Seed executed successfully');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map