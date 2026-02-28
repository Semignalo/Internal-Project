declare enum Priority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare class CreateTaskDto {
    title: string;
    description?: string;
    priority?: Priority;
    deadline?: string;
    status?: string;
    divisionId: string;
    dependencyId?: string;
    assigneeIds?: string[];
}
export {};
