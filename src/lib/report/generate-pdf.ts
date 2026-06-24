"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

export interface ReportMeta {
  productName: string;
  sizeName: string;
  batchDate: string;
  sampleCount: number;
}

/**
 * 대시보드 영역을 캡처하여 공정능력 보고서 PDF를 생성합니다.
 * - A4 가로(landscape) 형식
 * - 헤더: 제품명, 사이즈, 배치 날짜, 생성일시
 * - 본문: 대시보드 차트/테이블 캡처
 */
export async function generateReport(
  containerEl: HTMLElement,
  meta: ReportMeta,
): Promise<void> {
  // 캡처 전 print 모드 클래스 부여 (숨길 요소 처리)
  containerEl.classList.add("pdf-capture");

  const canvas = await html2canvas(containerEl, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    windowWidth: containerEl.scrollWidth,
    windowHeight: containerEl.scrollHeight,
  });

  containerEl.classList.remove("pdf-capture");

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const headerHeight = 22;
  const footerHeight = 8;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2 - headerHeight - footerHeight;

  // --- 헤더 ---
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Process Capability Report", margin, margin + 7);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100);
  const infoY = margin + 13;
  pdf.text(`Product: ${meta.productName}  |  Size: #${meta.sizeName}`, margin, infoY);
  pdf.text(
    `Batch: ${meta.batchDate}  |  Samples: ${meta.sampleCount}  |  Generated: ${new Date().toLocaleString("ko-KR")}`,
    margin,
    infoY + 5,
  );
  pdf.setTextColor(0);

  // 헤더 구분선
  pdf.setDrawColor(200);
  pdf.setLineWidth(0.3);
  pdf.line(margin, margin + headerHeight, pageWidth - margin, margin + headerHeight);

  // --- 본문: 캡처 이미지를 페이지에 맞게 분할 ---
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = contentWidth / imgWidth;
  const scaledFullHeight = imgHeight * ratio;

  // 한 페이지에 들어갈 원본 이미지 높이
  const sliceHeightPx = contentHeight / ratio;
  const totalPages = Math.ceil(imgHeight / sliceHeightPx);

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) pdf.addPage();

    const srcY = page * sliceHeightPx;
    const srcH = Math.min(sliceHeightPx, imgHeight - srcY);
    const destH = srcH * ratio;

    // 슬라이스 캔버스 생성
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = imgWidth;
    sliceCanvas.height = srcH;
    const ctx = sliceCanvas.getContext("2d")!;
    ctx.drawImage(canvas, 0, srcY, imgWidth, srcH, 0, 0, imgWidth, srcH);

    const sliceDataUrl = sliceCanvas.toDataURL("image/png");
    const destY = margin + headerHeight + 2;

    pdf.addImage(sliceDataUrl, "PNG", margin, destY, contentWidth, destH);

    // 페이지 번호 (푸터)
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(
      `${page + 1} / ${totalPages}`,
      pageWidth / 2,
      pageHeight - margin,
      { align: "center" },
    );
    pdf.setTextColor(0);

    // 후속 페이지에도 헤더 구분선 표시
    if (page > 0) {
      pdf.setFontSize(9);
      pdf.setTextColor(100);
      pdf.text(
        `Process Capability Report — ${meta.productName} #${meta.sizeName}`,
        margin,
        margin + 7,
      );
      pdf.setTextColor(0);
      pdf.setDrawColor(200);
      pdf.setLineWidth(0.3);
      pdf.line(margin, margin + headerHeight, pageWidth - margin, margin + headerHeight);
    }
  }

  // 파일명: QLens_제품명_사이즈_날짜.pdf
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const fileName = `QLens_${meta.productName}_${meta.sizeName}_${dateStr}.pdf`;
  pdf.save(fileName);
}
