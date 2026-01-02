"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Webhook, Slack, Send, Trash2 } from "lucide-react"

interface WebhookConfig {
  id: string
  name: string
  type: "slack" | "discord" | "custom"
  url: string
  enabled: boolean
  events: string[]
  customPayload?: string
}

interface WebhookSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (webhooks: WebhookConfig[]) => void
  initialWebhooks?: WebhookConfig[]
}

export function WebhookSettingsDialog({
  isOpen,
  onClose,
  onSave,
  initialWebhooks = [],
}: WebhookSettingsDialogProps) {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(initialWebhooks)
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null)

  const handleAddWebhook = () => {
    const newWebhook: WebhookConfig = {
      id: Date.now().toString(),
      name: "Novo Webhook",
      type: "custom",
      url: "",
      enabled: true,
      events: ["service_down", "service_recovered"],
    }
    setEditingWebhook(newWebhook)
  }

  const handleSaveWebhook = () => {
    if (!editingWebhook) return

    const existingIndex = webhooks.findIndex((w) => w.id === editingWebhook.id)
    if (existingIndex >= 0) {
      const updated = [...webhooks]
      updated[existingIndex] = editingWebhook
      setWebhooks(updated)
    } else {
      setWebhooks([...webhooks, editingWebhook])
    }
    setEditingWebhook(null)
  }

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id))
  }

  const handleToggleWebhook = (id: string) => {
    setWebhooks(
      webhooks.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    )
  }

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    try {
      const payload = webhook.type === "slack"
        ? {
            text: "🔔 Teste de Webhook - Sistema de Monitoramento",
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: "*Teste de Webhook*\nSe você está vendo esta mensagem, o webhook está funcionando corretamente! ✅",
                },
              },
            ],
          }
        : webhook.type === "discord"
        ? {
            content: "🔔 Teste de Webhook - Sistema de Monitoramento",
            embeds: [
              {
                title: "Teste de Webhook",
                description: "Se você está vendo esta mensagem, o webhook está funcionando corretamente! ✅",
                color: 3066993,
                timestamp: new Date().toISOString(),
              },
            ],
          }
        : JSON.parse(webhook.customPayload || '{"message": "Test"}')

      await fetch(webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      alert("✅ Webhook testado com sucesso!")
    } catch (error) {
      alert("❌ Erro ao testar webhook: " + (error as Error).message)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Configurar Webhooks
          </DialogTitle>
          <DialogDescription>
            Configure notificações para Slack, Discord ou endpoints personalizados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Webhooks List */}
          <div className="space-y-2">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <Switch
                  checked={webhook.enabled}
                  onCheckedChange={() => handleToggleWebhook(webhook.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {webhook.type === "slack" ? (
                      <Slack className="h-4 w-4" />
                    ) : webhook.type === "discord" ? (
                      <Send className="h-4 w-4" />
                    ) : (
                      <Webhook className="h-4 w-4" />
                    )}
                    <span className="font-medium">{webhook.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({webhook.type})
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {webhook.url}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingWebhook(webhook)}
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestWebhook(webhook)}
                >
                  Testar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteWebhook(webhook.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Edit Form */}
          {editingWebhook && (
            <div className="border-t pt-4 space-y-4">
              <h3 className="font-semibold">
                {webhooks.find((w) => w.id === editingWebhook.id)
                  ? "Editar Webhook"
                  : "Novo Webhook"}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={editingWebhook.name}
                    onChange={(e) =>
                      setEditingWebhook({ ...editingWebhook, name: e.target.value })
                    }
                    placeholder="Ex: Slack - Canal Alertas"
                  />
                </div>

                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={editingWebhook.type}
                    onValueChange={(value: "slack" | "discord" | "custom") =>
                      setEditingWebhook({ ...editingWebhook, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slack">Slack</SelectItem>
                      <SelectItem value="discord">Discord</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>URL do Webhook</Label>
                <Input
                  value={editingWebhook.url}
                  onChange={(e) =>
                    setEditingWebhook({ ...editingWebhook, url: e.target.value })
                  }
                  placeholder="https://hooks.slack.com/services/..."
                />
              </div>

              {editingWebhook.type === "custom" && (
                <div>
                  <Label>Payload Personalizado (JSON)</Label>
                  <Textarea
                    value={editingWebhook.customPayload || ""}
                    onChange={(e) =>
                      setEditingWebhook({
                        ...editingWebhook,
                        customPayload: e.target.value,
                      })
                    }
                    placeholder='{"message": "{{message}}", "service": "{{service}}"}'
                    rows={4}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSaveWebhook}>Salvar Webhook</Button>
                <Button variant="outline" onClick={() => setEditingWebhook(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <Button onClick={handleAddWebhook} variant="outline" className="w-full">
            + Adicionar Webhook
          </Button>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSave(webhooks)
              onClose()
            }}
          >
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
