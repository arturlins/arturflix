import { Head, router, usePage } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'
import GuestLayout from '@/layouts/GuestLayout'
import type { PageProps } from '@/types'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif']
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

interface FormState {
    name: string
    email: string
    subject: string
    message: string
}

interface FormErrors {
    name?: string
    email?: string
    subject?: string
    message?: string
    attachment?: string
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function SuporteIndex() {
    const { auth } = usePage<PageProps>().props
    const [form, setForm] = useState<FormState>({
        name: auth.user?.name ?? '',
        email: auth.user?.email ?? '',
        subject: '',
        message: '',
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({})
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [attachment, setAttachment] = useState<File | null>(null)
    const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!attachment) {
            setAttachmentPreview(null)
            return
        }
        const url = URL.createObjectURL(attachment)
        setAttachmentPreview(url)
        return () => URL.revokeObjectURL(url)
    }, [attachment])

    function validateAttachment(file: File): string | undefined {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            return 'Formato inválido. Envie JPG, PNG ou GIF.'
        }
        if (file.size > MAX_IMAGE_BYTES) {
            return 'Arquivo acima de 5 MB.'
        }
        return undefined
    }

    function handleAttachmentSelected(file: File | null) {
        if (!file) {
            setAttachment(null)
            setErrors((prev) => ({ ...prev, attachment: undefined }))
            return
        }
        const error = validateAttachment(file)
        if (error) {
            setAttachment(null)
            setErrors((prev) => ({ ...prev, attachment: error }))
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }
        setAttachment(file)
        setErrors((prev) => ({ ...prev, attachment: undefined }))
    }

    function handleRemoveAttachment() {
        setAttachment(null)
        setErrors((prev) => ({ ...prev, attachment: undefined }))
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0] ?? null
        handleAttachmentSelected(file)
    }

    function validate(field: keyof FormState, value: string): string | undefined {
        if (field === 'name' && value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres.'
        if (field === 'email' && !EMAIL_REGEX.test(value)) return 'Informe um e-mail válido.'
        if (field === 'subject' && !value) return 'Selecione um assunto.'
        if (field === 'message' && value.trim().length < 10) return 'Mensagem deve ter pelo menos 10 caracteres.'
        if (field === 'message' && value.length > 1000) return 'Mensagem deve ter no máximo 1.000 caracteres.'
        return undefined
    }

    function handleBlur(field: keyof FormState) {
        setTouched((prev) => ({ ...prev, [field]: true }))
        setErrors((prev) => ({ ...prev, [field]: validate(field, form[field]) }))
    }

    function handleChange(field: keyof FormState, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }))
        if (touched[field]) {
            setErrors((prev) => ({ ...prev, [field]: validate(field, value) }))
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const newErrors: FormErrors = {}
        ;(Object.keys(form) as (keyof FormState)[]).forEach((field) => {
            const err = validate(field, form[field])
            if (err) newErrors[field] = err
        })
        setErrors(newErrors)
        setTouched({ name: true, email: true, subject: true, message: true })
        if (Object.keys(newErrors).length > 0) return

        const payload = new FormData()
        payload.append('name', form.name)
        payload.append('email', form.email)
        payload.append('subject', form.subject)
        payload.append('message', form.message)
        if (attachment) payload.append('attachment', attachment)

        setLoading(true)
        router.post(route('suporte.store'), payload, {
            forceFormData: true,
            onSuccess: () => setSuccess(true),
            onError: (serverErrors) => {
                setErrors(serverErrors as unknown as FormErrors)
            },
            onFinish: () => setLoading(false),
        })
    }

    const inputClass = (field: keyof FormState) =>
        `w-full bg-[#171b23] border rounded-lg px-3 py-2.5 text-sm text-[#f1f1f1] placeholder:text-[#555] focus:outline-none transition-colors ${
            touched[field] && errors[field]
                ? 'border-[#E50914]'
                : 'border-[#1e2430] focus:border-[#E50914]'
        }`

    return (
        <GuestLayout>
            <Head title="Suporte" />

            <div className="max-w-6xl mx-auto px-6 py-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-[#f1f1f1] mb-2">Suporte</h1>
                    <p className="text-[#8a8a8a]">Estamos aqui para ajudar. Entre em contato pelo canal de sua preferência.</p>
                </header>


                {/* Formulário */}
                <section className="max-w-xl">
                    <h2 className="text-[#f1f1f1] text-2xl font-bold mb-6">Enviar mensagem</h2>

                    {success ? (
                        <div className="bg-green-950/40 border border-green-900/50 rounded-xl p-6 text-center">
                            <span className="text-3xl mb-3 block">✅</span>
                            <p className="text-green-400 font-medium">Mensagem enviada!</p>
                            <p className="text-[#8a8a8a] text-sm mt-1">Retornaremos em até 24 horas úteis.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} method="POST" noValidate className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm text-[#f1f1f1] mb-1.5">
                                    Nome <span className="text-[#E50914]">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    onBlur={() => handleBlur('name')}
                                    placeholder="Seu nome"
                                    required
                                    minLength={2}
                                    readOnly={!!auth.user}
                                    className={inputClass('name')}
                                />
                                {touched.name && errors.name && (
                                    <span className="text-red-400 text-xs mt-1 block">{errors.name}</span>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm text-[#f1f1f1] mb-1.5">
                                    E-mail <span className="text-[#E50914]">*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    onBlur={() => handleBlur('email')}
                                    placeholder="seu@email.com"
                                    required
                                    readOnly={!!auth.user}
                                    className={inputClass('email')}
                                />
                                {touched.email && errors.email && (
                                    <span className="text-red-400 text-xs mt-1 block">{errors.email}</span>
                                )}
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm text-[#f1f1f1] mb-1.5">
                                    Assunto <span className="text-[#E50914]">*</span>
                                </label>
                                <select
                                    id="subject"
                                    value={form.subject}
                                    onChange={(e) => handleChange('subject', e.target.value)}
                                    onBlur={() => handleBlur('subject')}
                                    required
                                    className={inputClass('subject')}
                                >
                                    <option value="">Selecione um assunto</option>
                                    <option value="tecnico">Dúvida técnica</option>
                                    <option value="cobranca">Cobrança</option>
                                    <option value="sugestao">Sugestão</option>
                                    <option value="outro">Outro</option>
                                </select>
                                {touched.subject && errors.subject && (
                                    <span className="text-red-400 text-xs mt-1 block">{errors.subject}</span>
                                )}
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm text-[#f1f1f1] mb-1.5">
                                    Mensagem <span className="text-[#E50914]">*</span>
                                </label>
                                <textarea
                                    id="message"
                                    rows={5}
                                    value={form.message}
                                    onChange={(e) => handleChange('message', e.target.value)}
                                    onBlur={() => handleBlur('message')}
                                    placeholder="Descreva sua dúvida ou problema..."
                                    required
                                    minLength={10}
                                    maxLength={1000}
                                    className={inputClass('message')}
                                />
                                <div className="flex items-center justify-between mt-1">
                                    {touched.message && errors.message ? (
                                        <span className="text-red-400 text-xs">{errors.message}</span>
                                    ) : (
                                        <span />
                                    )}
                                    <span className={`text-xs ${form.message.length > 950 ? 'text-red-400' : 'text-[#555]'}`}>
                                        {form.message.length}/1.000
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-[#f1f1f1] mb-1.5">
                                    Anexar imagem <span className="text-[#555] font-normal">(opcional)</span>
                                </label>

                                <input
                                    ref={fileInputRef}
                                    id="attachment"
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif"
                                    onChange={(e) => handleAttachmentSelected(e.target.files?.[0] ?? null)}
                                    className="sr-only"
                                />

                                {attachment && attachmentPreview ? (
                                    <div className="flex items-center gap-3 bg-[#171b23] border border-[#1e2430] rounded-lg p-3">
                                        <img
                                            src={attachmentPreview}
                                            alt="Pré-visualização do anexo"
                                            className="w-14 h-14 rounded-md object-cover flex-shrink-0 border border-[#1e2430]"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-[#f1f1f1] truncate">{attachment.name}</p>
                                            <p className="text-xs text-[#8a8a8a]">{formatBytes(attachment.size)}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveAttachment}
                                            className="text-[#8a8a8a] hover:text-[#E50914] text-xs font-medium px-2 py-1 rounded transition-colors"
                                            aria-label="Remover imagem"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="attachment"
                                        onDragOver={(e) => {
                                            e.preventDefault()
                                            setIsDragging(true)
                                        }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleDrop}
                                        className={`flex flex-col items-center justify-center gap-1.5 cursor-pointer rounded-lg border border-dashed px-4 py-6 text-center transition-colors ${
                                            errors.attachment
                                                ? 'border-[#E50914] bg-[#E50914]/5'
                                                : isDragging
                                                ? 'border-[#E50914] bg-[#E50914]/5'
                                                : 'border-[#1e2430] bg-[#171b23] hover:border-[#2a3240]'
                                        }`}
                                    >
                                        <svg
                                            className="w-6 h-6 text-[#8a8a8a]"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={1.5}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 7.5 7.5 12M12 7.5V21"
                                            />
                                        </svg>
                                        <span className="text-sm text-[#f1f1f1]">
                                            Clique para enviar <span className="text-[#8a8a8a]">ou arraste aqui</span>
                                        </span>
                                        <span className="text-xs text-[#555]">JPG, PNG ou GIF · até 5 MB</span>
                                    </label>
                                )}

                                {errors.attachment && (
                                    <span className="text-red-400 text-xs mt-1 block">{errors.attachment}</span>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#E50914] hover:bg-[#c20710] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2"
                            >
                                {loading ? 'Enviando...' : 'Enviar mensagem'}
                            </button>
                        </form>
                    )}
                </section>
            </div>
        </GuestLayout>
    )
}
