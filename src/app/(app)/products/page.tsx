"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Package, Plus, Trash2 } from "lucide-react";

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);

  async function loadProducts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("diadent_profiles")
      .select("default_org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.default_org_id) return;
    setOrgId(profile.default_org_id);

    const { data } = await supabase
      .from("diadent_products")
      .select("*")
      .eq("org_id", profile.default_org_id)
      .order("created_at");

    if (data) setProducts(data as Product[]);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadProducts(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    setLoading(true);

    await supabase.from("diadent_products").insert({
      org_id: orgId,
      name,
      code: code || null,
    });

    setName("");
    setCode("");
    setLoading(false);
    loadProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm("이 제품을 삭제하시겠습니까? 하위 사이즈·배치가 모두 삭제됩니다.")) return;
    await supabase.from("diadent_products").delete().eq("id", id);
    loadProducts();
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-3xl font-bold text-foreground tracking-tight">
          제품 관리
        </h2>
        <p className="text-muted-foreground mt-1">
          분석 대상 제품 및 사이즈를 등록하고 관리합니다.
        </p>
      </div>

      <Card className="border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border bg-card">
          <h3 className="font-heading text-base font-semibold text-clinical-blue">새 제품 추가</h3>
        </div>
        <CardContent className="pt-5">
          <form onSubmit={handleCreate} className="flex gap-3">
            <Input
              placeholder="제품명 (예: Confirm Fit GP)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border-surface-border"
            />
            <Input
              placeholder="코드 (선택)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-40 border-surface-border"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-clinical-blue hover:brightness-110 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {products.map((p) => (
          <Card key={p.id} className="border-surface-border hover:clinical-shadow transition-all">
            <CardContent className="flex items-center justify-between py-4 px-6">
              <Link
                href={`/products/${p.id}`}
                className="font-heading font-semibold text-clinical-blue hover:underline"
              >
                {p.name}
                {p.code && (
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    ({p.code})
                  </span>
                )}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(p.id)}
                className="hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {products.length === 0 && (
          <Card className="border-surface-border">
            <CardContent className="py-16 text-center text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-3 text-clinical-blue opacity-50" />
              등록된 제품이 없습니다.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
