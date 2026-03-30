"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { submitStoreSignup } from "@/lib/services/catalog-service";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatCnpj = (value: string) => {
  const digits = onlyDigits(value).slice(0, 14);

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

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

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

const stepLabels = [
  "Loja",
  "Contato e Pix",
  "Endereco",
  "Seguranca",
] as const;

interface AddressState {
  zipCode: string;
  state: string;
  city: string;
  district: string;
  street: string;
  number: string;
  complement: string;
}

export function StoreSignupForm() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState("Vamos montar a configuracao da loja em etapas curtas, com foco total em uma decisao por vez.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdStore, setCreatedStore] = useState<{ id: number; name: string; slug: string } | null>(null);
  const [address, setAddress] = useState<AddressState>({
    zipCode: "",
    state: "",
    city: "",
    district: "",
    street: "",
    number: "",
    complement: "",
  });
  const [zipStatus, setZipStatus] = useState("Preencha o CEP para buscar endereco automaticamente.");
  const [isLoadingZip, setIsLoadingZip] = useState(false);

  const isAddressReady = useMemo(
    () => Boolean(address.state && address.city && address.street),
    [address.city, address.state, address.street],
  );

  const generatedSlug = useMemo(() => slugify(storeName), [storeName]);

  const updateAddressField = <K extends keyof AddressState>(field: K, value: AddressState[K]) => {
    setAddress((current) => ({ ...current, [field]: value }));
  };

  const handleZipLookup = async () => {
    const cleanZip = onlyDigits(address.zipCode);

    if (cleanZip.length !== 8) {
      setZipStatus("Informe um CEP valido com 8 digitos para buscar o endereco.");
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
      setZipStatus("Endereco preenchido automaticamente a partir do CEP.");
    } catch {
      setZipStatus("Nao foi possivel consultar o CEP agora. Verifique sua conexao e tente novamente.");
    } finally {
      setIsLoadingZip(false);
    }
  };

  const validateStep = (targetStep = step) => {
    if (targetStep === 0) {
      if (!storeName.trim() || !ownerName.trim() || onlyDigits(cnpj).length !== 14) {
        setFeedback("Preencha nome da loja, responsavel e CNPJ valido antes de continuar.");
        return false;
      }
    }

    if (targetStep === 1) {
      if (!email.trim() || onlyDigits(whatsapp).length < 10 || !pixKey.trim()) {
        setFeedback("Preencha e-mail comercial, WhatsApp e chave Pix antes de continuar.");
        return false;
      }
    }

    if (targetStep === 2) {
      if (onlyDigits(address.zipCode).length !== 8 || !address.city.trim() || !address.state.trim() || !address.street.trim() || !address.number.trim()) {
        setFeedback("Complete CEP, cidade, estado, rua e numero para seguir para a revisao.");
        return false;
      }
    }

    if (targetStep === 3) {
      if (!generatedSlug) {
        setFeedback("Informe um nome valido para gerar o link principal da loja.");
        return false;
      }

      if (password.length < 6) {
        setFeedback("Crie uma senha com pelo menos 6 caracteres para concluir o cadastro.");
        return false;
      }

      if (password !== confirmPassword) {
        setFeedback("A confirmacao de senha precisa ser igual a senha criada.");
        return false;
      }
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
    setFeedback("Etapa validada. Vamos seguir mantendo o cadastro mais elegante e sem distracoes.");
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await submitStoreSignup({
        name: storeName.trim(),
        slug: generatedSlug,
        ownerName: ownerName.trim(),
        ownerEmail: email.trim(),
        whatsapp,
        cnpj,
        pixKey: pixKey.trim(),
        zipCode: address.zipCode,
        state: address.state.trim(),
        city: address.city.trim(),
        district: address.district.trim(),
        street: address.street.trim(),
        number: address.number.trim(),
        complement: address.complement.trim(),
      });

      setCreatedStore(created);
      setSubmitted(true);
      setFeedback(`Loja criada na API com sucesso. Redirecionando para o painel do lojista com a loja /lojas/${created.slug}.`);
      window.setTimeout(() => {
        router.push("/painel-lojista");
      }, 1200);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel salvar a loja na API.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] lg:p-8">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Configuracao da loja</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Cadastro guiado em etapas</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              O fluxo agora evita excesso de informacao na tela e conduz o lojista por blocos curtos ate a revisao final.
            </p>
          </div>
          <span className="w-fit rounded-full bg-[rgba(15,118,110,0.12)] px-4 py-2 text-xs font-semibold text-[var(--accent-strong)]">
            Etapa {step + 1} de {stepLabels.length}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {stepLabels.map((label, index) => {
            const isCurrent = index === step;
            const isDone = index < step;

            return (
              <div key={label} className={`rounded-[1.5rem] border px-4 py-4 ${isCurrent ? "border-[var(--accent)] bg-[rgba(15,118,110,0.08)]" : isDone ? "border-emerald-200 bg-emerald-50" : "border-[var(--border)] bg-slate-50"}`}>
                <div className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${isCurrent ? "bg-[var(--accent)] text-white" : isDone ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`}>
                    0{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                    <p className="text-xs text-[var(--muted)]">{isCurrent ? "Etapa atual" : isDone ? "Concluida" : "A seguir"}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-[var(--border)] bg-white p-5 sm:p-6">
        {step === 0 ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Dados principais da loja</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Primeiro registramos a identidade comercial principal da operacao.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-900">Nome da loja</span>
                <input value={storeName} onChange={(event) => setStoreName(event.target.value)} type="text" placeholder="Ex.: Aurora Atelier" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">Responsavel</span>
                <input value={ownerName} onChange={(event) => setOwnerName(event.target.value)} type="text" placeholder="Nome do responsavel" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">CNPJ</span>
                <input value={cnpj} onChange={(event) => setCnpj(formatCnpj(event.target.value))} inputMode="numeric" type="text" placeholder="00.000.000/0000-00" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
              </label>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Contato e recebimento</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Aqui ficam os dados de contato da loja e a configuracao principal para pagamento.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-900">E-mail comercial</span>
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="contato@minhaloja.com" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">WhatsApp da loja</span>
                <input value={whatsapp} onChange={(event) => setWhatsapp(formatPhone(event.target.value))} inputMode="tel" type="text" placeholder="(11) 99999-0000" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">Chave Pix</span>
                <input value={pixKey} onChange={(event) => setPixKey(event.target.value)} type="text" placeholder="pix@minhaloja.com" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
              </label>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Endereco da loja</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Use o CEP para preencher os campos automaticamente e depois finalize os detalhes manuais.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">CEP</span>
                <input
                  value={address.zipCode}
                  onChange={(event) => updateAddressField("zipCode", formatCep(event.target.value))}
                  onBlur={handleZipLookup}
                  inputMode="numeric"
                  type="text"
                  placeholder="00000-000"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
                />
              </label>
              <div className="flex items-end">
                <button type="button" onClick={handleZipLookup} className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                  {isLoadingZip ? "Buscando CEP..." : "Consultar CEP"}
                </button>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">Cidade</span>
                <input value={address.city} onChange={(event) => updateAddressField("city", event.target.value)} type="text" placeholder="Sua cidade" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">Estado</span>
                <input value={address.state} onChange={(event) => updateAddressField("state", event.target.value.toUpperCase().slice(0, 2))} type="text" placeholder="UF" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm uppercase outline-none transition focus:border-[var(--accent)]" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">Bairro</span>
                <input value={address.district} onChange={(event) => updateAddressField("district", event.target.value)} type="text" placeholder="Seu bairro" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-900">Rua</span>
                <input value={address.street} onChange={(event) => updateAddressField("street", event.target.value)} type="text" placeholder="Rua ou avenida" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">Numero</span>
                <input value={address.number} onChange={(event) => updateAddressField("number", event.target.value)} type="text" placeholder="123" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">Complemento</span>
                <input value={address.complement} onChange={(event) => updateAddressField("complement", event.target.value)} type="text" placeholder="Sala, loja, referencia" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
              </label>
            </div>

            <div className="rounded-[1.5rem] border border-[var(--border)] bg-slate-50 p-4 text-sm leading-6 text-[var(--muted)]">
              {zipStatus}
              <div className="mt-2 text-slate-700">
                {isAddressReady ? "Endereco principal preenchido e pronto para revisao." : "Os campos principais do endereco serao completados automaticamente quando o CEP for encontrado."}
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Seguranca e revisao final</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Crie a senha de acesso do responsavel e confira os dados principais antes de concluir.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">Senha de acesso</span>
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Minimo de 6 caracteres" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-900">Confirmar senha</span>
                <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" placeholder="Repita a senha" className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]" />
              </label>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-slate-50 p-4">
                <p className="text-sm text-[var(--muted)]">Loja</p>
                <strong className="mt-2 block text-xl text-slate-900">{storeName || "Loja sem nome"}</strong>
                <p className="mt-2 text-sm text-[var(--muted)]">Responsavel: {ownerName || "Nao informado"}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">CNPJ: {cnpj || "Nao informado"}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Slug da loja: /lojas/{generatedSlug || "sua-loja"}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-slate-50 p-4">
                <p className="text-sm text-[var(--muted)]">Contato e recebimento</p>
                <strong className="mt-2 block text-xl text-slate-900">{email || "Sem e-mail comercial"}</strong>
                <p className="mt-2 text-sm text-[var(--muted)]">WhatsApp: {whatsapp || "Nao informado"}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Pix: {pixKey || "Nao informado"}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--border)] bg-slate-50 p-4 lg:col-span-2">
                <p className="text-sm text-[var(--muted)]">Endereco</p>
                <strong className="mt-2 block text-xl text-slate-900">{address.street ? `${address.street}, ${address.number}` : "Endereco ainda nao preenchido"}</strong>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {address.district || "Bairro nao informado"} • {address.city || "Cidade nao informada"} - {address.state || "UF"}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">CEP: {address.zipCode || "Nao informado"}</p>
                {address.complement ? <p className="mt-1 text-sm text-[var(--muted)]">Complemento: {address.complement}</p> : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 rounded-2xl border border-[var(--border)] bg-slate-50 px-4 py-3 text-sm leading-6 text-[var(--muted)]">
        {feedback}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={() => setStep((current) => Math.max(current - 1, 0))} className={`rounded-full px-5 py-3 text-sm font-semibold transition ${step === 0 ? "cursor-not-allowed border border-[var(--border)] bg-slate-100 text-slate-400" : "border border-[var(--border)] bg-white text-slate-800 hover:border-[var(--accent)]"}`} disabled={step === 0}>
          Voltar etapa
        </button>

        <div className="flex flex-wrap gap-3">
          {step < 3 ? (
            <button type="button" onClick={handleNextStep} className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">
              Continuar
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]" disabled={isSubmitting}>
              {isSubmitting ? "Salvando loja..." : "Concluir cadastro"}
            </button>
          )}
        </div>
      </div>

      {submitted ? (
        <div className="mt-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
          Loja criada com sucesso na API. {createdStore ? <>Registro <span className="font-semibold">#{createdStore.id}</span> criado para <span className="font-semibold">{createdStore.name}</span>. Link principal preparado em <span className="font-semibold">/lojas/{createdStore.slug}</span>. </> : null}
          Para teste do fluxo, voce pode seguir para o <Link href="/painel-lojista" className="font-semibold underline">painel do lojista</Link> e continuar navegando pelas telas.
        </div>
      ) : null}

      <div className="mt-6 rounded-[1.5rem] border border-[var(--border)] bg-white p-4 text-sm leading-6 text-[var(--muted)]">
        O cadastro agora persiste a loja na API. A senha ja entra no fluxo final de validacao e sera conectada ao modulo real de autenticacao assim que fecharmos a fase de usuarios.
      </div>
    </article>
  );
}
