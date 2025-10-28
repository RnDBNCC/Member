interface Absence {
    id: number;
    user_id: number;
    class_session_id: number;
    status: string;
}

interface UserClass {
    id: number;
    user_id: number;
    class_id: number;
}

interface Class {
    id: number;
    name: string;
    dayOfWeek: string;
    time: string;
    knowledge_id: number;
    praetorian_id: number;
}

interface ClassSession {
    id: number;
    session_id: number;
    class_id: number;
    schedule: Date;
    recording_url: string;
    session_documentation_url: string;
}

interface RescheduleHistory {
    id: number;
    schedule: Date;
    approved: string;
    class_session_id: number;
}