// Mock Tauri invoke for web preview (when not running in Tauri)
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

const mockData: Record<string, (...args: any[]) => Promise<any>> = {
  search_boliger: async (args: any) => {
    await new Promise(r => setTimeout(r, 800));
    const query = args?.req?.query?.toLowerCase() || '';
    const results = [
      {
        title: 'Lys 3-værelses på Østerbro',
        price: 13400,
        size: 82,
        location: 'Østerbro, København Ø',
        link: 'https://boligsiden.dk',
        rooms: 3,
        type: 'Lejlighed',
        floor: '3. sal',
        energy: 'B',
        available: '1. juni 2025',
        description: 'Smuk lys lejlighed med sydvendt altan, nyrenoveret køkken og badeværelse. Tæt på metro og indkøb.',
        images: []
      },
      {
        title: 'Moderne 2-værelses på Frederiksberg',
        price: 11900,
        size: 65,
        location: 'Frederiksberg C',
        link: 'https://boligsiden.dk',
        rooms: 2,
        type: 'Lejlighed',
        floor: '2. sal',
        energy: 'C',
        available: '1. maj 2025',
        description: 'Stilfuld lejlighed i klassisk Frederiksberg-ejendom. Høje lofter, parketgulve og stor stue.',
        images: []
      },
      {
        title: 'Rolig 4-værelses villa i Gentofte',
        price: 22500,
        size: 145,
        location: 'Gentofte',
        link: 'https://boligsiden.dk',
        rooms: 4,
        type: 'Villa',
        floor: 'Stueetage',
        energy: 'A',
        available: '1. juli 2025',
        description: 'Fantastisk villa med stor have, dobbelt garage og moderne køkken. Perfekt for familier.',
        images: []
      },
      {
        title: 'Hyggelig 1-værelses på Nørrebro',
        price: 8200,
        size: 38,
        location: 'Nørrebro, København N',
        link: 'https://boligsiden.dk',
        rooms: 1,
        type: 'Lejlighed',
        floor: '4. sal',
        energy: 'D',
        available: 'Straks',
        description: 'Kompakt og hyggelig lejlighed i det pulserende Nørrebro. Tæt på caféer, restauranter og S-tog.',
        images: []
      },
      {
        title: 'Eksklusiv penthouse på Amager',
        price: 18900,
        size: 110,
        location: 'Islands Brygge, København S',
        link: 'https://boligsiden.dk',
        rooms: 3,
        type: 'Penthouse',
        floor: '6. sal (top)',
        energy: 'A',
        available: '1. august 2025',
        description: 'Spektakulær udsigt over havnen. Tagterrasse, åbent køkken og luksuriøst badeværelse.',
        images: []
      }
    ];
    
    // Filter based on query
    if (query.includes('villa')) return results.filter(r => r.type === 'Villa');
    if (query.includes('1-værelses') || query.includes('1 værelses')) return results.filter(r => r.rooms === 1);
    if (query.includes('2-værelses') || query.includes('2 værelses')) return results.filter(r => r.rooms === 2);
    if (query.includes('3-værelses') || query.includes('3 værelses')) return results.filter(r => r.rooms === 3);
    if (query.includes('frederiksberg')) return results.filter(r => r.location.toLowerCase().includes('frederiksberg'));
    if (query.includes('nørrebro')) return results.filter(r => r.location.toLowerCase().includes('nørrebro'));
    if (query.includes('østerbro')) return results.filter(r => r.location.toLowerCase().includes('østerbro'));
    
    return results;
  },

  generate_staging: async (args: any) => {
    await new Promise(r => setTimeout(r, 1500));
    // Return a placeholder image URL
    return 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80';
  },

  validate_api_key: async (args: any) => {
    await new Promise(r => setTimeout(r, 500));
    return args?.key?.startsWith('xai-') || false;
  },

  save_api_key: async () => {
    await new Promise(r => setTimeout(r, 200));
    return null;
  },

  is_first_run: async () => {
    return !localStorage.getItem('davside_setup_done');
  },

  negotiate: async (args: any) => {
    await new Promise(r => setTimeout(r, 1200));
    const { asking_price, market_data } = args || {};
    const price = asking_price || 12000;
    const suggestion = Math.round(price * 0.92);
    return {
      suggestion: suggestion,
      reasoning: `Baseret på markedsdata for området er den udbudte pris på ${price.toLocaleString('da-DK')} kr/måned ${price > 13000 ? 'over' : 'på niveau med'} markedsgennemsnittet. Jeg anbefaler at starte forhandlingen ved ${suggestion.toLocaleString('da-DK')} kr/måned.`,
      tactics: [
        'Nævn lignende boliger i området til lavere pris',
        'Tilbyd at flytte ind hurtigere end ønsket dato',
        'Foreslå en længere lejeperiode mod lavere husleje',
        'Spørg om depositum kan reduceres'
      ],
      market_avg: Math.round(price * 0.95),
      confidence: 87
    };
  },

  check_contract: async (args: any) => {
    await new Promise(r => setTimeout(r, 1500));
    return {
      score: 72,
      issues: [
        {
          severity: 'high',
          title: 'Uklart opsigelsesvarsel',
          description: 'Kontrakten specificerer ikke tydeligt opsigelsesvarslet for udlejer. Dansk lejelov kræver minimum 3 måneders varsel.',
          section: 'Afsnit 8.2'
        },
        {
          severity: 'medium',
          title: 'Manglende vedligeholdelsesansvar',
          description: 'Det er uklart hvem der er ansvarlig for vedligeholdelse af hvidevarer. Tilføj en specifik klausul.',
          section: 'Afsnit 5.1'
        },
        {
          severity: 'low',
          title: 'Husordensregler ikke vedlagt',
          description: 'Kontrakten refererer til husordensregler, men disse er ikke vedlagt som bilag.',
          section: 'Afsnit 12'
        }
      ],
      positives: [
        'Depositum er inden for lovens grænser (3 måneders husleje)',
        'Lejeregulering er klart defineret (nettoprisindeks)',
        'Indflytningsdato er tydeligt angivet'
      ],
      recommendation: 'Kontrakten er acceptabel med forbehold. Bed udlejer om at præcisere opsigelsesvilkårene og vedligeholdelsesansvaret inden underskrift.'
    };
  }
};

export async function invoke<T = any>(command: string, args?: any): Promise<T> {
  if (isTauri) {
    try {
      const { invoke: tauriInvoke } = await import('@tauri-apps/api/core');
      return tauriInvoke<T>(command, args);
    } catch {
      // Fall through to mock
    }
  }
  
  const handler = mockData[command];
  if (handler) {
    return handler(args) as Promise<T>;
  }
  
  throw new Error(`Unknown command: ${command}`);
}
