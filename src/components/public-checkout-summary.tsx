"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui-button";
import { FormField, TextArea, TextInput } from "@/components/ui-form";
import { clearCheckoutDraft, loadCheckoutDraft } from "@/lib/checkout-draft-storage";
import { apiConfig } from "@/lib/config";
import { saveLocalOrder } from "@/lib/local-order-storage";
import { submitCheckoutOrder } from "@/lib/services/catalog-service";
import type { CheckoutPreview } from "@/types/catalog";

interface PublicCheckoutSummaryProps {
  checkout: CheckoutPreview;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const deliveryLabel = {
  entrega: "Entrega",
  retirada: "Retirada",
};

const normalizeWhatsappDigits = (value: string) => value.replace(/\D/g, "");

const formatWhatsappMask = (value: string) => {
  const digits = normalizeWhatsappDigits(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export function PublicCheckoutSummary({ checkout }: PublicCheckoutSummaryProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState(checkout.customer.fullName);
  const [whatsapp, setWhatsapp] = useState(checkout.customer.whatsapp);
  const [email, setEmail] = useState(checkout.customer.email);
  const [street, setStreet] = useState(checkout.address.street);
  const [number, setNumber] = useState("120");
  const [district, setDistrict] = useState(checkout.address.district);
  const [zipCode, setZipCode] = useState(checkout.address.zipCode);
  const [city, setCity] = useState(checkout.address.city);
  const [state, setState] = useState(checkout.address.state);
  const [complement, setComplement] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState(checkout.note);
  const [errorMessage, setErrorMessage] = useState("");

  const { cart } = checkout;
  const firstItem = cart.items[0];
  const canUseApiCheckout = !apiConfig.useMocks && Boolean(apiConfig.baseUrl);

  useEffect(() => {
    const draft = loadCheckoutDraft(cart.store.slug);
    if (!draft) {
      return;
    }

    const matchingItem = draft.items.find((item) => item.productSlug === firstItem?.productSlug);
    if (!matchingItem && draft.items.length > 0) {
      return;
    }

    if (draft.customerName) {
      setFullName(draft.customerName);
    }
    if (draft.customerWhatsapp) {
      setWhatsapp(draft.customerWhatsapp);
    }
    if (draft.email) {
      setEmail(draft.email);
    }
    if (draft.notes) {
      setNotes(draft.notes);
    }
  }, [cart.store.slug, firstItem?.productSlug]);


  const handleSubmit = () => {
    if (fullName.trim().length < 3) {
      setErrorMessage("Informe um nome valido para concluir o checkout.");
      return;
    }

    if (normalizeWhatsappDigits(whatsapp).length < 10) {
      setErrorMessage("Informe um WhatsApp valido para concluir o checkout.");
      return;
    }

    if (cart.deliveryType === "entrega") {
      const requiredAddress = [street, number, district, zipCode, city, state];
      if (requiredAddress.some((value) => value.trim().length === 0)) {
        setErrorMessage("Preencha o endereco completo para pedidos com entrega.");
        return;
      }
    }

    setErrorMessage("");

    if (!canUseApiCheckout) {
      router.push(`/lojas/${cart.store.slug}/pedido-confirmado${firstItem ? `?product=${firstItem.productSlug}&quantity=${firstItem.quantity}` : ""}`);
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitCheckoutOrder({
          storeId: cart.store.id,
          deliveryType: cart.deliveryType,
          paymentMethod: "pix",
          shippingCost: cart.shippingFee,
          notes,
          customer: {
            fullName,
            whatsapp,
            email,
          },
          address:
            cart.deliveryType === "entrega"
              ? {
                  street,
                  number,
                  district,
                  zipCode,
                  city,
                  state,
                  complement,
                  reference,
                }
              : undefined,
          items: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        });

        saveLocalOrder({
          id: `api-${result.code}`,
          code: result.code,
          createdAt: result.createdAt,
          storeId: String(result.storeId),
          storeSlug: cart.store.slug,
          storeName: cart.store.name,
          storeWhatsapp: result.store?.whatsapp ?? cart.store.whatsapp,
          pixKey: result.store?.pixKey ?? cart.store.pixKey,
          customerName: result.customer?.name ?? fullName,
          customerWhatsapp: formatWhatsappMask(result.customer?.whatsapp ?? whatsapp),
          notes: result.notes ?? notes,
          deliveryType: cart.deliveryType,
          addressLabel: result.address?.fullAddress ?? [street, number, district, city, state, zipCode].filter(Boolean).join(", "),
          items: result.items.map((item) => ({
            productId: String(item.productId),
            productName: item.productNameSnapshot,
            productSlug: item.product?.slug ?? "produto",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.lineTotal,
          })),
          subtotal: result.subtotal,
          total: result.total,
          status: "rascunho_local",
        });

        clearCheckoutDraft(cart.store.slug);

        const successQuery = new URLSearchParams();
        if (firstItem) {
          successQuery.set("product", firstItem.productSlug);
          successQuery.set("quantity", String(firstItem.quantity));
        }
        successQuery.set("orderCode", result.code);
        successQuery.set("orderId", String(result.id));
        router.push(`/lojas/${cart.store.slug}/pedido-confirmado?${successQuery.toString()}`);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel finalizar o checkout agora.");
      }
    });
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <article className="space-y-6">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Dados do cliente</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Este checkout ja pode persistir o pedido na API quando o ambiente estiver apontando para o PostgreSQL remoto.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FormField label="Nome completo" className="md:col-span-2">
              <TextInput value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </FormField>
            <FormField label="WhatsApp">
              <TextInput value={whatsapp} onChange={(event) => setWhatsapp(formatWhatsappMask(event.target.value))} />
            </FormField>
            <FormField label="E-mail">
              <TextInput type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </FormField>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Entrega e endereco</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FormField label="Rua" className="md:col-span-2">
              <TextInput value={street} onChange={(event) => setStreet(event.target.value)} />
            </FormField>
            <FormField label="Numero">
              <TextInput value={number} onChange={(event) => setNumber(event.target.value)} />
            </FormField>
            <FormField label="Complemento">
              <TextInput value={complement} onChange={(event) => setComplement(event.target.value)} placeholder="Opcional" />
            </FormField>
            <FormField label="Bairro">
              <TextInput value={district} onChange={(event) => setDistrict(event.target.value)} />
            </FormField>
            <FormField label="CEP">
              <TextInput value={zipCode} onChange={(event) => setZipCode(event.target.value)} />
            </FormField>
            <FormField label="Cidade">
              <TextInput value={city} onChange={(event) => setCity(event.target.value)} />
            </FormField>
            <FormField label="Estado">
              <TextInput value={state} onChange={(event) => setState(event.target.value)} maxLength={2} />
            </FormField>
            <FormField label="Referencia" className="md:col-span-2">
              <TextInput value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Opcional" />
            </FormField>
          </div>
          <FormField label="Observacoes" className="mt-5 block">
            <TextArea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </FormField>
          <div className="mt-5 flex flex-wrap gap-3 text-sm theme-muted">
            <span className="rounded-full theme-surface-soft px-3 py-1 font-medium">Entrega: {deliveryLabel[cart.deliveryType]}</span>
            <span className="rounded-full theme-surface-soft px-3 py-1 font-medium">Pagamento: {cart.paymentLabel}</span>
            <span className="rounded-full theme-surface-soft px-3 py-1 font-medium">
              {canUseApiCheckout ? "Checkout conectado ao PostgreSQL" : "Modo visual com fallback local"}
            </span>
          </div>
        </div>
      </article>

      <aside className="space-y-6">
        <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Confirmacao visual</p>
          <div className="mt-5 space-y-4 rounded-[1.75rem] theme-surface-card p-5">
            <div className="flex items-center justify-between gap-3 text-sm theme-muted">
              <span>Pedido</span>
              <strong className="theme-heading">{checkout.orderCode}</strong>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm theme-muted">
              <span>Subtotal</span>
              <strong className="theme-heading">{formatCurrency(cart.subtotal)}</strong>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm theme-muted">
              <span>Entrega</span>
              <strong className="theme-heading">{formatCurrency(cart.shippingFee)}</strong>
            </div>
            <div className="h-px bg-[var(--border)]" />
            <div className="flex items-center justify-between gap-3 text-base font-semibold theme-heading">
              <span>Total</span>
              <strong>{formatCurrency(cart.total)}</strong>
            </div>
          </div>
          <div className="mt-4 rounded-[1.5rem] theme-surface-card p-4 text-sm leading-6 text-[var(--muted)]">
            <p>{checkout.confirmationLabel}</p>
            <p className="mt-2">{checkout.note}</p>
          </div>
          {errorMessage ? (
            <div className="mt-4 rounded-[1.25rem] border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}
        </article>

        <article className="rounded-[2rem] border border-[var(--border)] bg-slate-900 p-6 text-white shadow-[var(--shadow)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Fechar pedido</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {canUseApiCheckout
              ? "Ao confirmar, o frontend envia os dados para a API, grava o pedido no PostgreSQL e segue para a tela de sucesso com o codigo real."
              : "Neste ambiente o checkout continua visual e segue para a tela de sucesso sem persistencia real."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/lojas/${cart.store.slug}/carrinho${firstItem ? `?product=${firstItem.productSlug}&quantity=${firstItem.quantity}` : ""}`} className="rounded-full theme-border-button px-4 py-2.5 text-sm font-semibold transition">
              Voltar para carrinho
            </Link>
            <Button type="button" size="lg" onClick={handleSubmit} disabled={isPending} className="px-5 py-2.5 text-sm">
              {isPending ? "Finalizando pedido..." : canUseApiCheckout ? "Confirmar pedido na API" : "Confirmar pedido no frontend"}
            </Button>
          </div>
        </article>
      </aside>
    </section>
  );
}
