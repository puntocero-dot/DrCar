'use client'

import { useEffect, useRef, useState } from 'react'
import { Upload, X, Loader2, ImageIcon, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface EvidenceUploadProps {
  taskId: string
  repairId: string
  requiresEvidence: boolean
  onUploaded: (url: string) => void
}

const MAX_FILES = 5
const MAX_SIZE_MB = 10
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const BUCKET = 'evidencias'

export function EvidenceUpload({ taskId, repairId, requiresEvidence, onUploaded }: EvidenceUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Load existing evidences from DB on mount
  useEffect(() => {
    if (!requiresEvidence) return
    async function fetchExisting() {
      const { data } = await (supabase.from('evidencias_multimedia') as any)
        .select('file_url')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })

      if (data && Array.isArray(data)) {
        setUploadedUrls(data.map((e: { file_url: string }) => e.file_url))
      }
    }
    fetchExisting()
  }, [taskId, requiresEvidence, supabase])

  if (!requiresEvidence) return null

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files)

    if (uploadedUrls.length + fileArr.length > MAX_FILES) {
      setError(`Máximo ${MAX_FILES} fotos por tarea`)
      return
    }

    const oversized = fileArr.find((f) => f.size > MAX_SIZE_BYTES)
    if (oversized) {
      setError(`"${oversized.name}" supera el límite de ${MAX_SIZE_MB}MB`)
      return
    }

    setError(null)
    setUploading(true)

    const newUrls: string[] = []

    for (const file of fileArr) {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = `repairs/${repairId}/${taskId}/${filename}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false })

      if (uploadError) {
        if (
          uploadError.message.toLowerCase().includes('bucket') ||
          uploadError.message.toLowerCase().includes('not found')
        ) {
          setError('Almacenamiento no configurado. Crea el bucket "evidencias" en Supabase Storage.')
        } else {
          setError(`Error al subir "${file.name}": ${uploadError.message}`)
        }
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
      const publicUrl = urlData.publicUrl

      // Persist to evidencias_multimedia
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await (supabase.from('evidencias_multimedia') as any).insert({
          task_id: taskId,
          reparacion_id: repairId,
          uploaded_by: session.user.id,
          file_type: 'image',
          file_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          is_before: false,
        })
      }

      newUrls.push(publicUrl)
      onUploaded(publicUrl)
    }

    setUploadedUrls((prev) => [...prev, ...newUrls])
    setUploading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files)
      // Reset input so same file can be re-uploaded if needed
      e.target.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }

  const removeUrl = (url: string) => {
    setUploadedUrls((prev) => prev.filter((u) => u !== url))
    // Note: file remains in Storage; removal from DB would require an extra delete call
  }

  const canUploadMore = uploadedUrls.length < MAX_FILES

  return (
    <div className="mt-4 pt-4 border-t border-steel-800/60 space-y-3">
      <p className="text-xs font-semibold text-steel-400 uppercase tracking-wider flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5 text-accent-400" />
        Evidencias fotográficas
        <span className="text-steel-600">({uploadedUrls.length}/{MAX_FILES})</span>
      </p>

      {/* Thumbnails */}
      {uploadedUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploadedUrls.map((url) => (
            <div key={url} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-steel-700">
              <img src={url} alt="Evidencia" className="w-full h-full object-cover" />
              <button
                onClick={() => removeUrl(url)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                title="Quitar de la vista"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drop Zone / Upload Button */}
      {canUploadMore && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-colors text-sm ${
            dragOver
              ? 'border-accent-500 bg-accent-500/10 text-accent-300'
              : 'border-steel-700 hover:border-steel-600 bg-navy-900/40 text-steel-400 hover:text-steel-300'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-accent-400" />
              <span>Subiendo foto...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>
                {dragOver ? 'Suelta aquí' : 'Subir foto'}
                <span className="text-steel-600 text-xs ml-1">
                  (máx. {MAX_SIZE_MB}MB · {MAX_FILES - uploadedUrls.length} restantes)
                </span>
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
