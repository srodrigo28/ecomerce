"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { FormField, TextArea, TextInput } from "@/components/ui-form";
import type { StoreSummary } from "@/types/catalog";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
};

const formatCep = (value: string) => {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
};

const stepLabels = ["Identidade", "Contato e Pix", "Endereco", "Entrega e revisao"] as const;

interface AddressState {
  zipCode: string;
  state: string;
  city: string;
  district: string;
  street: string;
  number: string;
  complement: string;
}

export function StoreSettingsForm({ store }: { store: StoreSummary }) {
  const [storeName, setStoreName] = useState(store.name || "");
  const [slug, setSlug] = useState(store.slug || "");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState(store.coverImageUrl ?? "");
  const [whatsapp, setWhatsapp] = useState(formatPhone(store.whatsapp ?? ""));
  const [email, setEmail] = useState(store.ownerEmail ?? "");
  const [pixKey, setPixKey] = useState(store.pixKey ?? "");
  const [businessHours, setBusinessHours] = useState("");
  const [deliveryPolicy, setDeliveryPolicy] = useState(store.deliveryLabel ?? "");
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState(`Dados atuais da loja ${store.name || "selecionada"} carregados para edicao. Campos visuais ainda sem suporte na API permanecem locais por enquanto.`);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState<AddressState>({
    zipCode: store.zipCode ?? "",
    state: store.state ?? "",
    city: store.city ?? "",
    district: store.district ?? "",
    street: store.street ?? "",
    number: store.number ?? "",
    complement: store.complement ?? "",
  });
  const [zipStatus, setZipStatus] = useState("O endereco da loja alimenta a vitrine, a retirada e a mensagem enviada no WhatsApp.");
  const [isLoadingZip, setIsLoadingZip] = useState(false);

  const isAddressReady = useMemo(() => Boolean(address.state && address.city && address.street), [address]);

  const updateAddressField = <K extends keyof AddressState>(field: K, value: AddressState[K]) => {
    setAddress((current) => ({ ...current, [field]: value }));
  };

  const handleZipLookup = async () => {
    const cleanZip = onlyDigits(address.zipCode);

    if (cleanZip.length !== 8) {
      setZipStatus("Informe um CEP valido com 8 digitos para atualizar o endereco da loja.");
      return;
    }

    try {
      setIsLoadingZip(true);
      setZipStatus("Buscando endereco pelo CEP...");
      const response = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);
      const data = await response.json();

      if (!response.ok || data.erro) {
        setZipStatus("Nao encontramos endereco para esse CEP. Confira e tente novamente.");
        return;
      }

      setAddress((current) => ({
        ...current,
        state: data.uf ?? current.state,
        city: data.localidade ?? current.city,
        district: data.bairro ?? current.district,
        street: data.logradouro ?? current.street,
      }));
      setZipStatus("Endereco atualizado automaticamente a partir do CEP.");
    } catch {
      setZipStatus("Nao foi possivel consultar o CEP agora. Tente novamente em instantes.");
    } finally {
      setIsLoadingZip(false);
    }
  };

  const validateStep = (targetStep = step) => {
    if (targetStep === 0 && (!storeName.trim() || !slug.trim() || !description.trim())) {
      setFeedback("Preencha nome, slug e descricao da loja antes de seguir.");
      return false;
    }

    if (targetStep === 1 && (!email.trim() || onlyDigits(whatsapp).length < 10 || !pixKey.trim())) {
      setFeedback("Preencha e-mail comercial, WhatsApp e chave Pix para continuar.");
      return false;
    }

    if (targetStep === 2 && (onlyDigits(address.zipCode).length !== 8 || !address.city.trim() || !address.state.trim() || !address.street.trim() || !address.number.trim())) {
      setFeedback("Complete CEP, cidade, estado, rua e numero para continuar.");
      return false;
    }

    if (targetStep === 3 && (!businessHours.trim() || !deliveryPolicy.trim())) {
      setFeedback("Defina horario de atendimento e politica de entrega antes de salvar.");
      return false;
    }

    return true;
  };

  const handleNextStep = async () => {
    if (step === 2 && onlyDigits(address.zipCode).length === 8 && !isAddressReady && !isLoadingZip) {
      await handleZipLookup();
    }

    if (!validateStep()) {
      return;
    }

    setStep((current) => Math.min(current + 1, stepLabels.length - 1));
    setFeedback("Etapa validada. A configuracao da loja segue focada e sem distracoes.");
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsSubmitting(false);
    setSubmitted(true);
    setFeedback("Configuracao validada localmente. Os dados base agora sao carregados da loja autenticada e os campos visuais seguem locais ate a API cobrir esse cadastro.");
  };

  return (
    <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Configuracao da loja</p>
          <h2 className="mt-2 text-3xl font-semibold theme-heading">Modulo dedicado para dados comerciais</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Aqui ficam os dados que movem a vitrine publica: identidade, contato, Pix, endereco, atendimento e politica de entrega.
          </p>
        </div>
        <span className="w-fit rounded-full bg-[rgba(15,118,110,0.12)] px-4 py-2 text-xs font-semibold text-[var(--accent-strong)]">
          Etapa {step + 1} de {stepLabels.length}
        </span>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {stepLabels.map((label, index) => {
          const isCurrent = index === step;
          const isDone = index < step;

          return (
            <div key={label} className={`rounded-[1.5rem] border px-4 py-4 ${isCurrent ? "border-[var(--accent)] bg-[rgba(15,118,110,0.08)]" : isDone ? "border-emerald-300 bg-emerald-500/10" : "border-[var(--border)] theme-surface-soft"}`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${isCurrent ? "bg-[var(--accent)] text-white" : isDone ? "bg-emerald-600 text-white" : "theme-surface-card theme-text"}`}>
                  0{index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold theme-heading">{label}</p>
                  <p className="text-xs text-[var(--muted)]">{isCurrent ? "Etapa atual" : isDone ? "Concluida" : "A seguir"}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-[var(--border)] theme-surface-card p-5 sm:p-6">
        {step === 0 ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold theme-heading">Identidade da loja</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Esses dados definem como a loja aparece na vitrine e nos links compartilhados.</p>
            </div>
            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Nome, slug, contato, Pix e endereco vieram da loja autenticada. Logo, capa, descricao, horario e politica ainda dependem de suporte dedicado na API para persistencia completa.
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Nome da loja" className="md:col-span-2">
                <TextInput value={storeName} onChange={(event) => setStoreName(event.target.value)} />
              </FormField>
              <FormField label="Slug publico">
                <TextInput value={slug} onChange={(event) => setSlug(event.target.value)} />
              </FormField>
              <FormField label="Logo da loja">
                <TextInput value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} />
              </FormField>
              <FormField label="Imagem de capa" className="md:col-span-2">
                <TextInput value={coverImageUrl} onChange={(event) => setCoverImageUrl(event.target.value)} />
              </FormField>
              <FormField label="Descricao da loja" className="md:col-span-2">
                <TextArea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
              </FormField>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold theme-heading">Contato e Pix</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Esses dados alimentam o botao de compra, a mensagem no WhatsApp e as instrucoes de pagamento.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="E-mail comercial" className="md:col-span-2">
                <TextInput value={email} onChange={(event) => setEmail(event.target.value)} />
              </FormField>
              <FormField label="WhatsApp da loja">
                <TextInput value={whatsapp} onChange={(event) => setWhatsapp(formatPhone(event.target.value))} />
              </FormField>
              <FormField label="Chave Pix">
                <TextInput value={pixKey} onChange={(event) => setPixKey(event.target.value)} />
              </FormField>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold theme-heading">Endereco da loja</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Esse endereco aparece na vitrine, no modal de compra e no fluxo de retirada.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="CEP">
                <TextInput value={address.zipCode} onChange={(event) => updateAddressField("zipCode", formatCep(event.target.value))} onBlur={handleZipLookup} />
              </FormField>
              <div className="flex items-end">
                <button type="button" onClick={handleZipLookup} className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                  {isLoadingZip ? "Buscando CEP..." : "Consultar CEP"}
                </button>
              </div>
              <FormField label="Cidade">
                <TextInput value={address.city} onChange={(event) => updateAddressField("city", event.target.value)} />
              </FormField>
              <FormField label="Estado">
                <TextInput value={address.state} onChange={(event) => updateAddressField("state", event.target.value.toUpperCase().slice(0, 2))} className="uppercase" />
              </FormField>
              <FormField label="Bairro">
                <TextInput value={address.district} onChange={(event) => updateAddressField("district", event.target.value)} />
              </FormField>
              <FormField label="Rua" className="md:col-span-2">
                <TextInput value={address.street} onChange={(event) => updateAddressField("street", event.target.value)} />
              </FormField>
              <FormField label="Numero">
                <TextInput value={address.number} onChange={(event) => updateAddressField("number", event.target.value)} />
              </FormField>
              <FormField label="Complemento">
                <TextInput value={address.complement} onChange={(event) => updateAddressField("complement", event.target.value)} />
              </FormField>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--border)] theme-surface-soft p-4 text-sm leading-6 text-[var(--muted)]">
              {zipStatus}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold theme-heading">Entrega e revisao final</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Feche as regras que aparecem na vitrine e no modal de compra antes de salvar.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Horario de atendimento">
                <TextInput value={businessHours} onChange={(event) => setBusinessHours(event.target.value)} />
              </FormField>
              <FormField label="Politica de entrega e retirada">
                <TextInput value={deliveryPolicy} onChange={(event) => setDeliveryPolicy(event.target.value)} />
              </FormField>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[var(--border)] theme-surface-soft p-4">
                <p className="text-sm text-[var(--muted)]">Preview da vitrine</p>
                <strong className="mt-2 block text-xl theme-heading">{storeName}</strong>
                <p className="mt-2 text-sm text-[var(--muted)]">/{slug}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{description}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--border)] theme-surface-soft p-4">
                <p className="text-sm text-[var(--muted)]">Resumo operacional</p>
                <p className="mt-2 text-sm text-[var(--muted)]">WhatsApp: <span className="font-medium theme-text">{whatsapp}</span></p>
                <p className="mt-1 text-sm text-[var(--muted)]">Pix: <span className="font-medium theme-text">{pixKey}</span></p>
                <p className="mt-1 text-sm text-[var(--muted)]">Endereco: <span className="font-medium theme-text">{address.street}, {address.number} • {address.district} • {address.city}-{address.state}</span></p>
                <p className="mt-1 text-sm text-[var(--muted)]">Atendimento: <span className="font-medium theme-text">{businessHours}</span></p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--border)] theme-surface-soft px-4 py-3 text-sm leading-6 text-[var(--muted)]">
        {feedback}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={() => setStep((current) => Math.max(current - 1, 0))} className={`rounded-full px-5 py-3 text-sm font-semibold transition ${step === 0 ? "cursor-not-allowed border border-[var(--border)] theme-surface-soft text-[var(--muted)]" : "theme-border-button"}`} disabled={step === 0}>
          Voltar etapa
        </button>

        <div className="flex flex-wrap gap-3">
          {step < stepLabels.length - 1 ? (
            <button type="button" onClick={handleNextStep} className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">
              Continuar
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar configuracoes"}
            </button>
          )}
          <Link href={`/lojas/${slug || store.slug}`} className="rounded-full px-5 py-3 text-sm font-semibold transition theme-dark-cta">
            Ver vitrine atual
          </Link>
        </div>
      </div>

      {submitted ? (
        <div className="mt-6 rounded-[1.5rem] border border-emerald-300 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-900 dark:text-emerald-100">
          Configuracao validada localmente com sucesso. Os dados base agora abrem com a loja autenticada em vez de valores mockados fixos.
        </div>
      ) : null}
    </article>
  );
}