"use client";

import { useRouter } from "next/navigation";

import { SellerProductForm } from "@/components/seller-product-form";
import type { SellerWorkspace } from "@/types/catalog";

export function SellerNewProductPageClient({ workspace }: { workspace: SellerWorkspace }) {
  const router = useRouter();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 2xl:px-10">
      <SellerProductForm workspace={workspace} onCancel={() => router.push("/painel-lojista/produtos")} />
    </main>
  );
}
