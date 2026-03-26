import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Clear existing
    await prisma.taskAssignee.deleteMany();
    await prisma.task.deleteMany();
    await prisma.division.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    // Create Users
    const u1 = await prisma.user.create({ data: { name: 'Stefan (UI/UX)', email: 'stefan@starinc.com', password: 'password', role: 'MEMBER', workloadLevel: 'NORMAL' } });
    const u2 = await prisma.user.create({ data: { name: 'Vito (Dev)', email: 'vito@starinc.com', password: 'password', role: 'MEMBER', workloadLevel: 'HIGH' } });
    const u3 = await prisma.user.create({ data: { name: 'Nanda (Copywriter)', email: 'nanda@starinc.com', password: 'password', role: 'MEMBER', workloadLevel: 'LOW' } });
    const u4 = await prisma.user.create({ data: { name: 'Lia (Design)', email: 'lia@starinc.com', password: 'password', role: 'MEMBER', workloadLevel: 'NORMAL' } });
    const manager = await prisma.user.create({ data: { name: 'Admin Manager', email: 'admin@starinc.com', password: 'password', role: 'PROJECT_MANAGER' } });

    // Helper functions for dates
    const daysFromNow = (days: number) => new Date(new Date().setDate(new Date().getDate() + days));

    // Project 1
    const p1 = await prisma.project.create({
        data: { name: 'Website Redesign', clientName: 'TechFlow', projectType: 'UI/UX', startDate: new Date(), deadline: daysFromNow(30), managerId: manager.id }
    });
    const d1_p1 = await prisma.division.create({ data: { name: 'UI Design', progressWeight: 50, projectId: p1.id } });
    const d2_p1 = await prisma.division.create({ data: { name: 'Frontend Dev', progressWeight: 50, projectId: p1.id } });

    await prisma.task.create({ data: { title: 'Wireframing User Dashboard', description: 'Create basic low-fidelity wireframes for the user dashboard module.', priority: 'HIGH', status: 'COMPLETED', deadline: daysFromNow(5), divisionId: d1_p1.id, assignees: { create: [{ userId: u1.id }, { userId: u4.id }] } } });
    await prisma.task.create({ data: { title: 'High-Fidelity UI Screens', description: 'Apply the new design system to the user dashboard.', priority: 'MEDIUM', status: 'IN_PROGRESS', deadline: daysFromNow(12), divisionId: d1_p1.id, assignees: { create: [{ userId: u1.id }] } } });
    await prisma.task.create({ data: { title: 'Component Library Setup', description: 'Initialize React component library using TailwindCSS.', priority: 'HIGH', status: 'TODO', deadline: daysFromNow(15), divisionId: d2_p1.id, assignees: { create: [{ userId: u2.id }] } } });

    // Project 2
    const p2 = await prisma.project.create({
        data: { name: 'Social Media Campaign Q4', clientName: 'UrbanStyle', projectType: 'Marketing', startDate: new Date(), deadline: daysFromNow(45), managerId: manager.id }
    });
    const d1_p2 = await prisma.division.create({ data: { name: 'Content Strategy', progressWeight: 30, projectId: p2.id } });
    const d2_p2 = await prisma.division.create({ data: { name: 'Video Production', progressWeight: 70, projectId: p2.id } });

    await prisma.task.create({ data: { title: 'Determine Campaign Target Audience', priority: 'HIGH', status: 'COMPLETED', deadline: daysFromNow(2), divisionId: d1_p2.id, assignees: { create: [{ userId: manager.id }] } } });
    await prisma.task.create({ data: { title: 'Draft Copy for Instagram Carousel', priority: 'MEDIUM', status: 'INTERNAL_REVIEW', deadline: daysFromNow(10), divisionId: d1_p2.id, assignees: { create: [{ userId: u3.id }] } } });
    await prisma.task.create({ data: { title: 'Shoot Promo Video for Sneakers', priority: 'URGENT', status: 'IN_PROGRESS', deadline: daysFromNow(20), divisionId: d2_p2.id, assignees: { create: [{ userId: u2.id }] } } });
    await prisma.task.create({ data: { title: 'Edit Promo Video & Color Grading', priority: 'MEDIUM', status: 'PLANNING', deadline: daysFromNow(25), divisionId: d2_p2.id, assignees: { create: [{ userId: u2.id }] } } });

    // Project 3
    const p3 = await prisma.project.create({
        data: { name: 'Corporate Rebranding', clientName: 'Oasis Beverages', projectType: 'Branding', startDate: new Date(), deadline: daysFromNow(60), managerId: manager.id }
    });
    const d1_p3 = await prisma.division.create({ data: { name: 'Logo Identity', progressWeight: 100, projectId: p3.id } });

    await prisma.task.create({ data: { title: 'Logo Concept Sketching', priority: 'MEDIUM', status: 'TODO', deadline: daysFromNow(14), divisionId: d1_p3.id, assignees: { create: [{ userId: u4.id }] } } });
    await prisma.task.create({ data: { title: 'Logo Vectorization & Alternates', priority: 'MEDIUM', status: 'PLANNING', deadline: daysFromNow(21), divisionId: d1_p3.id, assignees: { create: [{ userId: u4.id }] } } });

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
