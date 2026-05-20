import { defaultHeaderInterpreter } from './interpreter.js';
import { Header } from './headers.js';

describe('defaultHeaderInterpreter', () => {
  describe('when no headers are provided', () => {
    it('should return "not enough headers"', () => {
      expect(defaultHeaderInterpreter(undefined, 'client')).toBe('not enough headers');
      expect(defaultHeaderInterpreter(null as any, 'client')).toBe('not enough headers');
    });
  });

  describe('when cache-control headers are present', () => {
    describe('with no-cache directive', () => {
      it('should return "dont cache"', () => {
        const headers = {
          [Header.CacheControl]: 'no-cache'
        };
        expect(defaultHeaderInterpreter(headers, 'client')).toBe('dont cache');
      });
    });

    describe('with no-store directive', () => {
      it('should return "dont cache"', () => {
        const headers = {
          [Header.CacheControl]: 'no-store'
        };
        expect(defaultHeaderInterpreter(headers, 'client')).toBe('dont cache');
      });
    });

    describe('with private directive on server', () => {
      it('should return "dont cache"', () => {
        const headers = {
          [Header.CacheControl]: 'private'
        };
        expect(defaultHeaderInterpreter(headers, 'server')).toBe('dont cache');
      });

      it('should not return "dont cache" on client', () => {
        const headers = {
          [Header.CacheControl]: 'private'
        };
        expect(defaultHeaderInterpreter(headers, 'client')).toBe('not enough headers');
      });
    });

    describe('with immutable directive', () => {
      it('should return a cache duration of 1 year', () => {
        const headers = {
          [Header.CacheControl]: 'public, immutable, max-age=31536000'
        };
        const result = defaultHeaderInterpreter(headers, 'client');
        
        expect(result).toEqual({
          cache: 1000 * 60 * 60 * 24 * 365 // 1 year in milliseconds
        });
      });
    });

    describe('with max-age directive', () => {
      it('should return cache duration based on max-age', () => {
        const headers = {
          [Header.CacheControl]: 'max-age=300' // 5 minutes
        };
        const result = defaultHeaderInterpreter(headers, 'client');
        
        expect(result).toEqual({
          cache: 300 * 1000 // 300 seconds to milliseconds
        });
      });

      it('should subtract age from max-age if age header is present', () => {
        const headers = {
          [Header.CacheControl]: 'max-age=300', // 5 minutes
          [Header.Age]: '60' // 1 minute
        };
        const result = defaultHeaderInterpreter(headers, 'client');
        
        expect(result).toEqual({
          cache: (300 - 60) * 1000 // (300 - 60) seconds to milliseconds
        });
      });

      it('should handle max-stale directive for stale time', () => {
        const headers = {
          [Header.CacheControl]: 'max-age=300, max-stale=60'
        };
        const result = defaultHeaderInterpreter(headers, 'client');
        
        expect(result).toEqual({
          cache: 300 * 1000,
          stale: 60 * 1000
        });
      });

      it('should handle stale-while-revalidate directive for stale time', () => {
        const headers = {
          [Header.CacheControl]: 'max-age=300, stale-while-revalidate=120'
        };
        const result = defaultHeaderInterpreter(headers, 'client');
        
        expect(result).toEqual({
          cache: 300 * 1000,
          stale: 120 * 1000
        });
      });

      it('should prefer max-stale over stale-while-revalidate', () => {
        const headers = {
          [Header.CacheControl]: 'max-age=300, max-stale=60, stale-while-revalidate=120'
        };
        const result = defaultHeaderInterpreter(headers, 'client');
        
        expect(result).toEqual({
          cache: 300 * 1000,
          stale: 60 * 1000 // max-stale (60) preferred over stale-while-revalidate (120)
        });
      });

      it('should handle both max-stale and stale-while-revalidate when max-stale is not present', () => {
        const headers = {
          [Header.CacheControl]: 'max-age=300, stale-while-revalidate=120'
        };
        const result = defaultHeaderInterpreter(headers, 'client');
        
        expect(result).toEqual({
          cache: 300 * 1000,
          stale: 120 * 1000
        });
      });
    });
  });

  describe('when expires header is present', () => {
    it('should return cache duration based on time difference', () => {
      const futureDate = new Date(Date.now() + 60000); // 1 minute from now
      const headers = {
        [Header.Expires]: futureDate.toUTCString()
      };
      const result = defaultHeaderInterpreter(headers, 'client');
      
      expect(result).toEqual({
        cache: expect.any(Number)
      });
      
      // The cache value should be positive and close to 60000
      expect((result as any).cache).toBeGreaterThanOrEqual(59000);
    });

    it('should return "dont cache" if expires date is in the past', () => {
      const pastDate = new Date(Date.now() - 60000); // 1 minute ago
      const headers = {
        [Header.Expires]: pastDate.toUTCString()
      };
      const result = defaultHeaderInterpreter(headers, 'client');
      
      expect(result).toBe('dont cache');
    });
  });

  describe('when neither cache-control nor expires are present', () => {
    it('should return "not enough headers"', () => {
      const headers = {
        'content-type': 'application/json'
      };
      expect(defaultHeaderInterpreter(headers, 'client')).toBe('not enough headers');
    });
  });

  describe('complex cache-control scenarios', () => {
    it('should handle multiple directives in cache-control header', () => {
      const headers = {
        [Header.CacheControl]: 'public, max-age=3600, stale-while-revalidate=300, max-stale=60',
        [Header.Age]: '100'
      };
      const result = defaultHeaderInterpreter(headers, 'client');
      
      expect(result).toEqual({
        cache: (3600 - 100) * 1000,
        stale: 60 * 1000 // max-stale preferred over stale-while-revalidate
      });
    });
  });
});