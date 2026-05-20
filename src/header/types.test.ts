import type { InterpreterResult, HeaderInterpreter } from './types.js';
import type { CacheAxiosResponse } from '../cache/axios.js';
import type { InstanceLocation } from '../util/types.js';

describe('Header Types', () => {
  describe('InterpreterResult', () => {
    it('should accept "dont cache" string literal', () => {
      const result: InterpreterResult = 'dont cache';
      expect(result).toBe('dont cache');
    });

    it('should accept "not enough headers" string literal', () => {
      const result: InterpreterResult = 'not enough headers';
      expect(result).toBe('not enough headers');
    });

    it('should accept number values', () => {
      const result: InterpreterResult = 1000;
      expect(result).toBe(1000);
    });

    it('should accept object with cache property', () => {
      const result: InterpreterResult = { cache: 1000 };
      expect(result).toEqual({ cache: 1000 });
    });

    it('should accept object with cache and stale properties', () => {
      const result: InterpreterResult = { cache: 1000, stale: 500 };
      expect(result).toEqual({ cache: 1000, stale: 500 });
    });

    it('should allow stale property to be optional', () => {
      const resultWithStale: InterpreterResult = { cache: 1000, stale: 500 };
      const resultWithoutStale: InterpreterResult = { cache: 1000 };
      
      expect(resultWithStale).toEqual({ cache: 1000, stale: 500 });
      expect(resultWithoutStale).toEqual({ cache: 1000 });
    });
  });

  describe('HeaderInterpreter', () => {
    it('should be a function type that accepts headers and location', () => {
      const mockHeaders: CacheAxiosResponse['headers'] = {};
      const mockLocation: InstanceLocation = { 
        config: {}, 
        axiosConfig: {}, 
        cache: null,
        data: null
      };
      
      // Define a mock interpreter function to validate the type
      const interpreter: HeaderInterpreter = (headers, location) => {
        // This is just to test the type compatibility
        expect(headers).toBeDefined();
        expect(location).toBeDefined();
        
        // Return a valid InterpreterResult
        return 1000;
      };
      
      const result = interpreter(mockHeaders, mockLocation);
      expect(typeof result).toBe('number');
    });

    it('should return valid InterpreterResult types', () => {
      const mockHeaders: CacheAxiosResponse['headers'] = {};
      const mockLocation: InstanceLocation = { 
        config: {}, 
        axiosConfig: {}, 
        cache: null,
        data: null
      };
      
      // Test returning 'dont cache'
      const interpreter1: HeaderInterpreter = () => 'dont cache';
      expect(interpreter1(mockHeaders, mockLocation)).toBe('dont cache');

      // Test returning 'not enough headers'
      const interpreter2: HeaderInterpreter = () => 'not enough headers';
      expect(interpreter2(mockHeaders, mockLocation)).toBe('not enough headers');

      // Test returning number
      const interpreter3: HeaderInterpreter = () => 5000;
      expect(interpreter3(mockHeaders, mockLocation)).toBe(5000);

      // Test returning object with cache
      const interpreter4: HeaderInterpreter = () => ({ cache: 3000 });
      expect(interpreter4(mockHeaders, mockLocation)).toEqual({ cache: 3000 });

      // Test returning object with cache and stale
      const interpreter5: HeaderInterpreter = () => ({ cache: 3000, stale: 1500 });
      expect(interpreter5(mockHeaders, mockLocation)).toEqual({ cache: 3000, stale: 1500 });
    });
  });
});