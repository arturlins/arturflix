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

export interface CursoListItem {
    public_id: string
    titulo: string
    descricao: string | null
    url_capa: string | null
    channel: string | null
    total_aulas: number
    duracao_total_segundos: number
}
