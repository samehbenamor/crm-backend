export default () => ({
  port: 3000,
  
  supabase: {
    url: 'https://hwlkcotkmdmlnehiwamr.supabase.co',
    publicKey: process.env.SUPABASE_PUBLIC_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },

  security: {
    // You can add more security configurations here
    cors: {
      enabled: true,
      origin: process.env.CORS_ORIGIN || '*',
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },

});

// Configuration interface for type safety
export interface ConfigType {
  port: number;
  supabase: {
    url: string;
    publicKey: string;
    serviceKey: string;
  };
  security: {
    cors: {
      enabled: boolean;
      origin: string;
    };
    rateLimit: {
      windowMs: number;
      max: number;
    };
  };
}
