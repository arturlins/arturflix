export interface User {
    id: number
    public_id: string
    name: string
    email: string
    papel: 'aluno' | 'admin' | 'superuser'
    is_admin: boolean
    xp_total: number
    nivel_atual: number
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

export interface AulaStatus extends AulaItem {
    concluida: boolean
    em_andamento: boolean
}

export interface ModuloComStatus {
    public_id: string
    titulo: string
    ordem: number
    aulas: AulaStatus[]
}

export interface AulaAtual {
    public_id: string
    titulo: string
    tipo_aula: TipoAula
    conteudo: string | null
    duracao_segundos: number
    ordem: number
    youtube_video_id: string | null
    xp: number
    posicao_segundos: number
    concluida: boolean
}

export interface AutorComentario {
    public_id: string
    name: string
}

export interface RespostaComentario {
    public_id: string
    conteudo: string
    foi_editado: boolean
    created_at: string
    autor: AutorComentario
    is_owner: boolean
}

export interface Comentario extends RespostaComentario {
    respostas: RespostaComentario[]
}

export interface MeuCursoItemComProgresso extends MeuCursoItem {
    aulas_concluidas: number
}
