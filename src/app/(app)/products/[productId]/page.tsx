"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Product, ProductSize } from "@/lib/types";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const supabase = createClient();
  const [product, setProduct] = useState<Product | null>(null);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [sizeName, setSizeName] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const { data: prod } = await supabase
      .from("diadent_products")
      .select("*")
      .eq("id", productId)
      .single();
    if (prod) setProduct(prod as Product);

    const { data: s } = await supabase
      .from("diadent_product_sizes")
      .select("*")
      .eq("product_id", productId)
      .order("display_order");
    if (s) setSizes(s as ProductSize[]);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, [productId]);

  async function handleAddSize(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase.from("diadent_product_sizes").insert({
      product_id: productId,
      name: sizeName,
      display_order: sizes.length,
    });
    setSizeName("");
    setLoading(false);
    loadData();
  }

  async function handleDeleteSize(id: string) {
    if (!confirm("이 사이즈를 삭제하시겠습니까?")) return;
    await supabase.from("diadent_product_sizes").delete().eq("id", id);
    loadData();
  }

  if (!product) return <p>로딩 중...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{product.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">사이즈 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSize} className="flex gap-3">
            <Input
              placeholder="사이즈명 (예: F1, FX)"
              value={sizeName}
              onChange={(e) => setSizeName(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {sizes.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex items-center justify-between py-4">
              <Link
                href={`/products/${productId}/sizes/${s.id}`}
                className="font-medium hover:underline"
              >
                #{s.name}
                <span className="ml-2 text-sm text-muted-foreground">
                  규격 설정 →
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteSize(s.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {sizes.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            등록된 사이즈가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
