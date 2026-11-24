export interface MarketingImageAsset {
  id: string;
  src: string;
  width: number;
  height: number;
  altEs: string;
  altEn: string;
  captionEs: string;
  captionEn: string;
  isIllustrative: boolean;
}

export const COMMERCIAL_IMAGE_ASSETS: Record<
  'posBundleCounter' | 'retailTrainingSetup',
  MarketingImageAsset
> = {
  posBundleCounter: {
    id: 'pos-bundle-counter',
    src: '/src/assets/images/pos_bundle_counter_1795541986312.jpg',
    width: 1408,
    height: 768,
    altEs:
      'Mostrador comercial ilustrativo con computadora mostrando interfaz de punto de venta, impresora térmica de recibos y lector de códigos de barras',
    altEn:
      'Illustrative retail checkout counter with desktop computer showing point of sale interface, thermal receipt printer, and barcode scanner',
    captionEs:
      'Equipo ilustrativo: computadora todo-en-uno, impresora térmica 80mm y lector de códigos de barras. Marca y modelo sujetos a confirmación comercial.',
    captionEn:
      'Illustrative equipment: all-in-one computer, 80mm thermal printer, and barcode scanner. Brand and model confirmed in formal quote.',
    isIllustrative: true,
  },
  retailTrainingSetup: {
    id: 'retail-training-setup',
    src: '/src/assets/images/retail_training_setup_1795541999983.jpg',
    width: 1280,
    height: 960,
    altEs:
      'Especialista de implementación realizando instalación y capacitación de punto de venta junto a encargada de tienda en mostrador comercial',
    altEn:
      'Implementation specialist conducting point of sale installation and training alongside store manager at retail checkout counter',
    captionEs:
      'Instalación en mostrador y capacitación práctica de ventas, apertura y cierre de caja para tu equipo.',
    captionEn:
      'On-counter installation and hands-on sales, register opening, and closing training for your staff.',
    isIllustrative: true,
  },
};
