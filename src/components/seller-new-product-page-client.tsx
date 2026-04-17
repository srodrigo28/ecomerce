"use client";

import { useRouter } from "next/navigation";

import { SellerProductForm } from "@/components/seller-product-form";
import type { SellerWorkspace } from "@/types/catalog";

export function SellerNewProductPageClient({ workspace }: { workspace: SellerWorkspace }) {
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1180px] flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5 lg:px-5 lg:py-6 2xl:px-6">
      <SellerProductForm workspace={workspace} onCancel={() => router.push("/painel-lojista/produtos")} />
    </main>
  );
}
