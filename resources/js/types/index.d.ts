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

export type TipoAula = 'video' | 'texto' | 'quiz'

export interface AulaItem {
    public_id: string
    titulo: string
    tipo_aula: TipoAula
    duracao_segundos: number
    ordem: number
    youtube_video_id: string | null
}

export interface ModuloItem {
    public_id: string
    titulo: string
    ordem: number
    aulas: AulaItem[]
}

export interface CursoDetail {
    public_id: string
    titulo: string
    descricao: string | null
    url_capa: string | null
    channel: string | null
    total_aulas: number
    duracao_total_segundos: number
}

export interface MeuCursoItem {
    public_id: string
    titulo: string
    url_capa: string | null
    channel: string | null
    total_aulas: number
    duracao_total_segundos: number
    matriculado_em: string | null
    concluido_em: string | null
}
