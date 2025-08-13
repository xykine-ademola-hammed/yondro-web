import { useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF, { type jsPDFOptions } from "jspdf";

export type DownloadPdfOptions = {
  fileName?: string;
  format?: jsPDFOptions["format"];
  orientation?: jsPDFOptions["orientation"];
  margin?: number;
  scale?: number;
  hideSelectors?: Array<string | HTMLElement>;
  backgroundColor?: string;
  imageType?: "PNG" | "JPEG";
  onBeforeCapture?: () => void | Promise<void>;
  onAfterCapture?: () => void | Promise<void>;
  /** If true, skip html2canvas and use html-to-image directly */
  forceHtmlToImage?: boolean;
};

type UseDownloadPdf = () => (
  elementRef: React.RefObject<HTMLElement>,
  options?: DownloadPdfOptions
) => Promise<void>;

function resolveHideTargets(hideSelectors?: Array<string | HTMLElement>) {
  if (!hideSelectors?.length) return [] as HTMLElement[];
  const targets: HTMLElement[] = [];
  for (const sel of hideSelectors) {
    if (typeof sel === "string") {
      document
        .querySelectorAll<HTMLElement>(sel)
        .forEach((el) => targets.push(el));
    } else if (sel instanceof HTMLElement) {
      targets.push(sel);
    }
  }
  return targets;
}

async function renderWithHtml2Canvas(
  el: HTMLElement,
  scale: number,
  backgroundColor: string
) {
  const canvas = await html2canvas(el, {
    scale,
    useCORS: true,
    backgroundColor,
    // @ts-expect-error widely supported though not in types
    removeContainer: true,
  });
  return canvas.toDataURL("image/png");
}

async function renderWithHtmlToImage(el: HTMLElement) {
  const { toPng } = await import("html-to-image");
  return toPng(el, {
    cacheBust: true,
    pixelRatio: 2, // like scale
    // You can add filter to skip nodes if needed
  });
}

const useDownloadPdf: UseDownloadPdf = () => {
  const downloadPdf = useCallback(async (elementRef, options = {}) => {
    const {
      fileName = "document.pdf",
      format = "a4",
      orientation = "portrait",
      margin = 24,
      scale = 2,
      hideSelectors,
      backgroundColor = "#ffffff",
      imageType = "PNG",
      onBeforeCapture,
      onAfterCapture,
      forceHtmlToImage = false,
    } = options;

    if (!elementRef?.current) {
      console.error("useDownloadPdf: No element ref provided.");
      return;
    }

    const hiddenTargets = resolveHideTargets(hideSelectors);
    const originalStyles = new Map<HTMLElement, string | null>();
    const hideAll = () => {
      hiddenTargets.forEach((el) => {
        originalStyles.set(el, el.getAttribute("style"));
        el.style.visibility = "hidden";
      });
    };
    const restoreAll = () => {
      hiddenTargets.forEach((el) => {
        const prev = originalStyles.get(el);
        if (prev === null || prev === undefined) el.removeAttribute("style");
        else el.setAttribute("style", prev);
      });
    };

    try {
      if (onBeforeCapture) await onBeforeCapture();
      hideAll();

      let imgData: string | undefined;

      try {
        if (forceHtmlToImage) throw new Error("Skip html2canvas");
        // Primary path
        imgData = await renderWithHtml2Canvas(
          elementRef.current,
          scale,
          backgroundColor
        );
      } catch (primaryErr) {
        // Fallback for issues like "unsupported color function oklch"
        // eslint-disable-next-line no-console
        console.warn(
          "html2canvas failed, falling back to html-to-image:",
          primaryErr
        );
        imgData = await renderWithHtmlToImage(elementRef.current);
      }

      const pdf = new jsPDF({ orientation, unit: "pt", format });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const usableWidth = Math.max(pageWidth - margin * 2, 1);
      const x = margin;
      let y = margin;

      // We need the pixel size of the generated image to keep aspect ratio
      // Create a temp image to read intrinsic size
      const tmp = new Image();
      tmp.src = imgData!;
      await new Promise<void>((res, rej) => {
        tmp.onload = () => res();
        tmp.onerror = (e) => rej(e);
      });

      const imgWidth = usableWidth;
      const imgHeight = (tmp.naturalHeight * imgWidth) / tmp.naturalWidth;

      // First page
      pdf.addImage(imgData!, imageType, x, y, imgWidth, imgHeight);
      let heightLeft = imgHeight - (pageHeight - margin * 2);

      // Additional pages if content overflows
      while (heightLeft > 0) {
        pdf.addPage();
        y = margin - (imgHeight - heightLeft);
        pdf.addImage(imgData!, imageType, x, y, imgWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      pdf.save(fileName);
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      restoreAll();
      if (onAfterCapture) await onAfterCapture();
    }
  }, []);

  return downloadPdf;
};

export default useDownloadPdf;
