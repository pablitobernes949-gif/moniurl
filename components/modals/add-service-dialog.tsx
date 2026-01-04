"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (url: string, name: string) => Promise<void>
}

export function AddServiceDialog({ open, onOpenChange, onAdd }: AddServiceDialogProps) {
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = async () => {
    if (!name.trim() || !url.trim()) return

    setIsAdding(true)
    try {
      await onAdd(url.trim(), name.trim())
      setName("")
      setUrl("")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Serviço</DialogTitle>
          <DialogDescription>
            Configure o monitoramento para um novo serviço. Insira a URL ou IP do serviço que deseja monitorar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Serviço</Label>
            <Input id="name" placeholder="Ex: API de Produção" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL ou IP</Label>
            <Input
              id="url"
              placeholder="Ex: https://api.example.com ou 192.168.1.100"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Você pode inserir uma URL completa ou um endereço IP</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAdd} disabled={isAdding || !name || !url}>
            {isAdding ? (
              "Adicionando..."
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Serviço
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
