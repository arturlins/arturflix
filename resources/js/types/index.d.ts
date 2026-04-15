export interface User {
    id: number
    public_id: string
    name: string
    email: string
    papel: 'aluno' | 'admin' | 'superuser'
    is_admin: boolean
}

export interface PageProps {
    auth: {
        user: User | null
    }
    flash: {
        success: string | null
        error: string | null
    }
    [key: string]: unknown
}
