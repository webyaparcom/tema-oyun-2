/* sayac-skor-tablo — Sayaç Skor Tablosu — arcade ekranı, kürsü + sıralanabilir liste (16 Kas 2026 · mcp:webmaker/20261116-181132-t332 · D17).
   Kalın çerçeveli, tarama çizgili bir arcade ekranı: üstte kumanda ikonu ve yanıp sönen imleç, ilk üç rakam madalyalı kürsüde (2 · 1 · 3), altta orana göre sıralı skor listesi — sıra no, büyük harfli oyuncu (etiket), noktalı önder, mono skor; lider satır vurgulu. desing `sirala_ad` verilirse «Sırala» düğmesi listeyi ters çevirir (DOM sırası da). JS yoksa liste büyükten küçüğe.
   Üretici: scripts/modul-fabrika (aile stats) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: data: [{ sayi, onek?, sonek?, etiket, metin?, ikon?, ondalik?, max? }] — metinler dil sözlüğü; sayı geçersizse satır atlanır. */
const P = "modulex-sayac-skor-tablo";
const IMG_KOK = "/img/";
/* --- ortak ön ek (scripts/modul-fabrika/on-ek.js) — dil · güvenlik · sayı yardımcıları --- */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video|audio)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `${IMG_KOK}${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");
const ikonAd = (v) => String(v ?? "").trim().replace(/[^a-z0-9_]/gi, "");
const satirlar = (s) => esc(s).replace(/\r?\n/g, "<br />");
/* ilk dolu alan: yeni ad önce, eski kuşak şablonun adı yedek (G6 yalnız path değiştirerek takas eder) */
const ilk = (o, ks) => {
  for (const k of ks) {
    const v = o == null ? undefined : o[k];
    if (v == null || v === "") continue;
    if (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) continue;
    return v;
  }
  return "";
};
const metinAl = (o, ks) => pick(ilk(o, ks)).trim();
const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const veri = Array.isArray(json.data) ? json.data : [];
const dil = String(json.lang || "");
const sayiBicim = (v, ondalik) => {
  try { return new Intl.NumberFormat(dil || undefined, { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik }).format(v); } catch (e) { return String(v); }
};
const ikonH = (ad, sinif) => (ad ? `<span class="${sinif} material-symbols-outlined" aria-hidden="true">${ad}</span>` : "");
const no = (i) => String(i + 1).padStart(2, "0");
const ctaHtml = () => {
  const a1 = metinAl(des, ["cta_ad", "button"]); const u1 = href(ilk(des, ["cta_url", "buttonurl", "url"]));
  const a2 = metinAl(des, ["cta2_ad"]); const u2 = href(ilk(des, ["cta2_url"]));
  const d = (a, u, ek) => (a && u ? `<a class="${P}-dugme${ek}" href="${esc(u)}">${esc(a)}<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : "");
  const ic = d(a1, u1, "") + d(a2, u2, ` ${P}-dugme--ikincil`);
  return ic ? `<div class="${P}-cta">${ic}</div>` : "";
};
const basHtml = (B, ek) => {
  if (!B.ust && !B.baslik && !B.metin && !ek) return "";
  return `<header class="${P}-bas">`
    + (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "")
    + (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "")
    + (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "")
    + (ek || "")
    + "</header>";
};
/* --- aile: stats --- */
const sayiAl = (v) => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v ?? "").trim().replace(/\s/g, "").replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : null;
};
const ham = veri.map((o) => {
  const sv = ilk(o, ["sayi", "deger", "number", "value"]);
  const od = ilk(o, ["ondalik"]);
  const ondalik = od !== "" && Number.isInteger(Number(od)) ? Number(od) : (String(sv).split(".")[1] || "").length;
  return {
    sayi: sayiAl(sv), ondalik: Math.min(3, Math.max(0, ondalik)),
    onek: metinAl(o, ["onek", "prefix"]), sonek: metinAl(o, ["sonek", "suffix"]),
    etiket: metinAl(o, ["etiket", "label", "baslik", "title"]), metin: metinAl(o, ["metin", "aciklama", "description", "text"]),
    ikon: ikonAd(ilk(o, ["ikon", "icon"])), max: sayiAl(ilk(o, ["max", "hedef"])),
  };
}).filter((k) => k.sayi !== null && k.etiket);
const enBuyuk = Math.max(1, ...ham.map((k) => Math.abs(k.sayi)));
/* oran (0…1): max alanı > yüzde işareti (100) > listedeki en büyük sayı */
const kayitlar = ham.map((k) => {
  const tavan = k.max && k.max > 0 ? k.max : (/%/.test(k.onek + k.sonek) ? 100 : enBuyuk);
  return Object.assign(k, { oran: Math.min(1, Math.max(0, k.sayi / tavan)), bicimli: sayiBicim(k.sayi, k.ondalik) });
});
const sayiHtml = (k, s) => `<span class="${P}-${s || "sayi"}">`
  + (k.onek ? `<span class="${P}-ek">${esc(k.onek)}</span>` : "")
  + `<span data-hedef="${k.sayi}" data-ondalik="${k.ondalik}">${esc(k.bicimli)}</span>`
  + (k.sonek ? `<span class="${P}-ek">${esc(k.sonek)}</span>` : "") + "</span>";
const notH = (k) => (k.metin ? `<p class="${P}-not">${satirlar(k.metin)}</p>` : "");
/* --- modül: sayac-skor-tablo --- */
const kart = (k, i) => `<li class="${P}-skor${i === 0 ? ` ${P}-skor--lider` : ""}"><span class="${P}-derece"><bdi dir="ltr">${no(i)}</bdi></span><h3 class="${P}-oyuncu">${ikonH(k.ikon, `${P}-ikon`)}<span>${esc(k.etiket)}</span></h3><span class="${P}-onder" aria-hidden="true"></span>${sayiHtml(k, "puan")}${k.metin ? `<p class="${P}-not">${satirlar(k.metin)}</p>` : ""}</li>`;
const sar = (ic, A) => {
    const S = A.slice().sort((x, y) => y.oran - x.oran);
    const sa = metinAl(des, ["sirala_ad"]);
    const kup = ["emoji_events", "military_tech", "workspace_premium"];
    const kursu = S.length > 1 ? `<ol class="${P}-kursu" role="list">${S.slice(0, 3).map((k, r) => `<li class="${P}-basamak ${P}-basamak--${r + 1}">${ikonH(kup[r], `${P}-madalya`)}<p class="${P}-basamak-ad">${esc(k.etiket)}</p><span class="${P}-blok" aria-hidden="true" style="--h: ${3 - r}"><bdi dir="ltr">${no(r)}</bdi></span></li>`).join("")}</ol>` : "";
    const dug = sa ? `<button type="button" class="${P}-sirala" data-sirala aria-pressed="false" hidden>${ikonH("swap_vert", `${P}-sirala-i`)}${esc(sa)}</button>` : "";
    return `<div class="${P}-ekran"><div class="${P}-tepe"><span class="${P}-oyna" aria-hidden="true">${ikonH("sports_esports", "")}<span class="${P}-imlec"></span></span>${dug}</div>${kursu}<ol class="${P}-liste" role="list" data-sirala-liste>${S.map((k, r) => kart(k, r, S.length, S)).join("")}</ol></div>`;
  };
const B = { ust: metinAl(des, ["ust","badge","kicker"]), baslik: metinAl(des, ["baslik","title"]), metin: metinAl(des, ["metin","description"]) };
/* veri yoksa gövde hiç kurulmaz (sarmalayıcı boş listeye dokunmaz) */
const BOS = !kayitlar.length;
const govde = BOS ? "" : sar(kayitlar.map((k, i) => kart(k, i, kayitlar.length, kayitlar)).join(""), kayitlar, B);
const bas = basHtml(B, "");
const sinif = (bas || B.ust || B.baslik || B.metin ? "" : ` ${P}--bassiz`);
html = html
  .replaceAll("{{fbsinif}}", () => sinif)
  .replaceAll("{{fbetiket}}", () => (B.baslik ? `aria-labelledby="${P}-{{id}}-b"` : ""))
  .replaceAll("{{fbbas}}", () => bas)
  .replaceAll("{{fbgovde}}", () => govde);
if (BOS) html = "";
