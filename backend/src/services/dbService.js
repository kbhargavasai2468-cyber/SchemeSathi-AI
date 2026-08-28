import { getSupabaseClient } from '../config/supabase.js';

/**
 * Data Access Layer for SchemeSathi AI
 * Connects EXCLUSIVELY to live Supabase database tables:
 * `schemes`, `eligibility_rules`, `documents`.
 * STRICT: Zero local/mock fallback data allowed.
 */

export const dbService = {
  /**
   * Fetch schemes directly from Supabase
   * @param {Object} [filters={}]
   * @returns {Promise<Array>}
   */
  async getSchemes(filters = {}) {
    const client = getSupabaseClient();
    const { data, error } = await client.from('schemes').select('*');

    if (error) {
      console.error('Supabase query error on "schemes":', error);
      throw new Error(`Failed to fetch schemes from Supabase: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get single scheme by ID from Supabase
   * @param {string} schemeId
   * @returns {Promise<Object|null>}
   */
  async getSchemeById(schemeId) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('schemes')
      .select('*')
      .eq('id', schemeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // row not found
      console.error(`Supabase query error on scheme "${schemeId}":`, error);
      throw new Error(`Failed to fetch scheme "${schemeId}" from Supabase: ${error.message}`);
    }

    return data;
  },

  /**
   * Fetch eligibility rules from Supabase
   * @param {Array<string>} schemeIds
   * @returns {Promise<Array>}
   */
  async getEligibilityRules(schemeIds = []) {
    if (!schemeIds || schemeIds.length === 0) return [];

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('eligibility_rules')
      .select('*')
      .in('scheme_id', schemeIds);

    if (error) {
      console.error('Supabase query error on "eligibility_rules":', error);
      throw new Error(`Failed to fetch eligibility rules from Supabase: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Fetch documents from Supabase
   * @param {Array<string>} schemeIds
   * @returns {Promise<Array>}
   */
  async getDocuments(schemeIds = []) {
    if (!schemeIds || schemeIds.length === 0) return [];

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('documents')
      .select('*')
      .in('scheme_id', schemeIds);

    if (error) {
      console.error('Supabase query error on "documents":', error);
      throw new Error(`Failed to fetch documents from Supabase: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Authoritative lookup for anti-hallucination verification
   * @param {string} schemeId
   * @returns {Promise<Object|null>}
   */
  async getAuthoritativeSchemeRecord(schemeId) {
    return this.getSchemeById(schemeId);
  }
};

export default dbService;
