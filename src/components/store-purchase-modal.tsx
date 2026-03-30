"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui-badge";
import { Button } from "@/components/ui-button";
import { Card } from "@/components/ui-card";
import { FormField, TextArea, TextInput } from "@/components/ui-form";
import { Modal } from "@/components/ui-modal";
import { saveLocalOrder } from "@/lib/local-order-storage";
import type { CartDeliveryType, LocalOrderDraft, StorePurchasePreview } from "@/types/catalog";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const normalizeWhatsapp = (value: string) => value.replace(/\D/g, "");

const formatWhatsappMask = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const buildOrderCode = (storeSlug: string) => {
  const stamp = Date.now().toString().slice(-6);
  return `PED-${storeSlug.toUpperCase().slice(0, 5)}-${stamp}`;
};

export function StorePurchaseModal({ purchasePreview }: { purchasePreview: StorePurchasePreview }) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(String(purchasePreview.suggestedQuantity));
  const [deliveryType, setDeliveryType] = useState<CartDeliveryType>("entrega");
  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  const [lastOrderCode, setLastOrderCode] = useState("");

  const numericQuantity = Math.max(1, Number.parseInt(quantity, 10) || 1);
  const subtotal = purchasePreview.product.priceRetail * numericQuantity;
  const hasValidCustomer = customerName.trim().length >= 3 && normalizeWhatsapp(customerWhatsapp).length >= 10;

  const whatsappMessage = useMemo(() => {
    const lines = [
      `Ola, quero comprar ${numericQuantity}x ${purchasePreview.product.name}.`,
      `Loja: ${purchasePreview.store.name}`,
      `Categoria: ${purchasePreview.category?.name ?? "Catalogo da loja"}`,
      `Subtotal: ${formatCurrency(subtotal)}`,
      `Forma de recebimento: ${deliveryType === "entrega" ? "Entrega" : "Retirada na loja"}`,
      `Endereco da loja: ${purchasePreview.addressLabel}`,
      purchasePreview.pixKey ? `Chave Pix: ${purchasePreview.pixKey}` : "",
      customerName.trim() ? `Cliente: ${customerName.trim()}` : "",
      normalizeWhatsapp(customerWhatsapp) ? `WhatsApp do cliente: ${formatWhatsappMask(customerWhatsapp)}` : "",
      notes.trim() ? `Observacoes: ${notes.trim()}` : "",
      "Estou vindo da vitrine da Hierarquia e quero finalizar o pedido.",
    ].filter(Boolean);

    return lines.join("\n");
  }, [
    customerName,
    customerWhatsapp,
    deliveryType,
    notes,
    numericQuantity,
    purchasePreview.addressLabel,
    purchasePreview.category?.name,
    purchasePreview.pixKey,
    purchasePreview.product.name,
    purchasePreview.store.name,
    subtotal,
  ]);

  const whatsappHref = `https://wa.me/55${purchasePreview.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleSaveOrder = () => {
    if (!hasValidCustomer) {
      return;
    }

    const code = buildOrderCode(purchasePreview.store.slug);
    const order: LocalOrderDraft = {
      id: `local-${code}`,
      code,
      createdAt: new Date().toISOString(),
      storeId: purchasePreview.store.id,
      storeSlug: purchasePreview.store.slug,
      storeName: purchasePreview.store.name,
      storeWhatsapp: purchasePreview.whatsappNumber,
      pixKey: purchasePreview.pixKey,
      customerName: customerName.trim(),
      customerWhatsapp: formatWhatsappMask(customerWhatsapp),
      notes: notes.trim(),
      deliveryType,
      addressLabel: purchasePreview.addressLabel,
      items: [
        {
          productId: purchasePreview.product.id,
          productName: purchasePreview.product.name,
          productSlug: purchasePreview.product.slug,
          quantity: numericQuantity,
          unitPrice: purchasePreview.product.priceRetail,
          totalPrice: subtotal,
        },
      ],
      subtotal,
      total: subtotal,
      status: "rascunho_local",
    };

    saveLocalOrder(order);
    setLastOrderCode(code);
    window.open(whatsappHref, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Button type="button" size="lg" onClick={() => setIsOpen(true)}>
        Comprar agora
      </Button>

      {isOpen ? (
        <Modal
          onClose={() => setIsOpen(false)}
          title={purchasePreview.product.name}
          description="Escolha a quantidade, confirme como deseja receber e dispare a conversa pronta no WhatsApp da loja com Pix e endereco ja preenchidos."
        >
          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <Card variant="glass" className="rounded-[1.75rem] p-5 sm:p-6">
                <div className="grid gap-5 md:grid-cols-[150px_minmax(0,1fr)]">
                  <div className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={purchasePreview.product.imageUrls[0]} alt={purchasePreview.product.name} className="aspect-[4/5] h-full w-full object-cover" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="accent">{purchasePreview.category?.name ?? "Catalogo da loja"}</Badge>
                      <Badge variant={purchasePreview.product.stock > 0 ? "success" : "danger"}>
                        {purchasePreview.product.stock > 0 ? `Estoque ${purchasePreview.product.stock}` : "Sem estoque"}
                      </Badge>
                      <Badge variant="neutral">Pix pronto</Badge>
                    </div>
                    <div>
                      <strong className="block text-3xl theme-heading">{formatCurrency(purchasePreview.product.priceRetail)}</strong>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{purchasePreview.product.description}</p>
                    </div>
                    <div className="rounded-[1.25rem] theme-surface-card p-4 text-sm leading-7 text-[var(--muted)]">
                      <p>Loja: <span className="font-medium theme-text">{purchasePreview.store.name}</span></p>
                      <p>Endereco completo: <span className="font-medium theme-text">{purchasePreview.addressLabel}</span></p>
                      <p>Atendimento: <span className="font-medium theme-text">{formatWhatsappMask(purchasePreview.whatsappNumber)}</span></p>
                      <p>Entrega: <span className="font-medium theme-text">{purchasePreview.deliveryLabel}</span></p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card variant="glass" className="rounded-[1.75rem] p-5 sm:p-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField label="Seu nome" className="text-sm">
                    <TextInput value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Nome para identificar o pedido" />
                  </FormField>
                  <FormField label="Seu WhatsApp" className="text-sm">
                    <TextInput value={customerWhatsapp} onChange={(event) => setCustomerWhatsapp(formatWhatsappMask(event.target.value))} placeholder="(11) 99999-9999" />
                  </FormField>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-[140px_minmax(0,1fr)]">
                  <FormField label="Quantidade" className="text-sm">
                    <TextInput type="number" min={1} max={Math.max(1, purchasePreview.product.stock || 1)} value={quantity} onChange={(event) => setQuantity(event.target.value)} />
                  </FormField>
                  <div className="space-y-2 text-sm">
                    <span className="font-semibold theme-text">Recebimento</span>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryType("entrega")}
                        className={`rounded-[1.25rem] border px-4 py-4 text-left transition ${deliveryType === "entrega" ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]" : "border-[var(--border)] theme-surface-card"}`}
                      >
                        <strong className="block theme-heading">Entrega</strong>
                        <span className="mt-1 block text-sm text-[var(--muted)]">Compartilha endereco da loja e orienta atendimento no WhatsApp.</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryType("retirada")}
                        className={`rounded-[1.25rem] border px-4 py-4 text-left transition ${deliveryType === "retirada" ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]" : "border-[var(--border)] theme-surface-card"}`}
                      >
                        <strong className="block theme-heading">Retirada na loja</strong>
                        <span className="mt-1 block text-sm text-[var(--muted)]">Mostra o endereco completo para facilitar a visita.</span>
                      </button>
                    </div>
                  </div>
                </div>

                <FormField label="Observacoes" className="mt-5 block text-sm">
                  <TextArea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder="Ex.: quero confirmar tamanho, cor ou horario para retirada" />
                </FormField>
              </Card>
            </div>

            <aside className="space-y-6 xl:sticky xl:top-4 xl:self-start">
              <Card className="rounded-[1.75rem] border-white/10 bg-[var(--dark-panel)] p-5 text-white shadow-[var(--shadow)] sm:p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Resumo comercial</p>
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-200">
                  <p>Produto: <span className="font-medium text-white">{purchasePreview.product.name}</span></p>
                  <p>Quantidade: <span className="font-medium text-white">{numericQuantity}</span></p>
                  <p>Total parcial: <span className="font-medium text-white">{formatCurrency(subtotal)}</span></p>
                  <p>Canal final: <span className="font-medium text-white">WhatsApp da loja</span></p>
                  <p>Pix cadastrado: <span className="font-medium text-white">{purchasePreview.pixKey ?? "A confirmar"}</span></p>
                </div>
                <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
                  O pedido sera salvo localmente no navegador antes de abrir o WhatsApp, preparando a transicao futura para a API.
                </div>
                {lastOrderCode ? (
                  <div className="mt-4 rounded-[1.25rem] border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                    Pedido local salvo com o codigo <strong>{lastOrderCode}</strong>.
                  </div>
                ) : null}
                <div className="mt-5 grid gap-3">
                  <Button type="button" size="lg" onClick={handleSaveOrder} className="justify-center text-center" disabled={!hasValidCustomer}>
                    Salvar pedido e enviar no WhatsApp
                  </Button>
                  <Button as="a" href={whatsappHref} target="_blank" rel="noreferrer" variant="secondary" size="lg" className="justify-center text-center">
                    Abrir WhatsApp direto
                  </Button>
                </div>
              </Card>

              <Card variant="glass" className="rounded-[1.75rem] p-5 sm:p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Mensagem pronta</p>
                <pre className="mt-4 whitespace-pre-wrap rounded-[1.25rem] theme-surface-card p-4 text-sm leading-7 text-[var(--muted)]">{whatsappMessage}</pre>
              </Card>
            </aside>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
