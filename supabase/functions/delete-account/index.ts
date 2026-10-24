// Permanently deletes the signed-in user's account and data (App Store and Google Play
// require in-app account deletion). The Flutter app only cleared data on the device.
//
// Called by the app with the user's session; deletes:
//   - their votes (and lowers the upvote counts they added)
//   - their answers (and lowers answer counts on other people's questions)
//   - their questions, with the answers and votes on them
//   - their bookmarks, journey data, reports and self-checks
//   - their profile picture
//   - the auth user itself
//
// Uses the SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY variables that
// Supabase provides to every Edge Function. The service role key never leaves the server.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

class StepError extends Error {}

/** Throws with the step name so a failure is easy to trace in the function logs. */
function check(step: string, error: { message: string } | null) {
  if (error) throw new StepError(`${step}: ${error.message}`);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Identify the caller from their own session token.
  const authHeader = req.headers.get('Authorization') ?? '';
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return jsonResponse({ error: 'Not signed in' }, 401);
  const userId = userData.user.id;

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  try {
    // Votes: remove the user's votes and the counts they added.
    const questionVotes = await admin.from('question_votes').select('question_id').eq('user_id', userId);
    check('read question votes', questionVotes.error);
    for (const vote of questionVotes.data ?? []) {
      await admin.rpc('decrement_question_upvotes', { question_id_param: vote.question_id });
    }
    check('delete question votes', (await admin.from('question_votes').delete().eq('user_id', userId)).error);

    const answerVotes = await admin.from('answer_votes').select('answer_id').eq('user_id', userId);
    check('read answer votes', answerVotes.error);
    for (const vote of answerVotes.data ?? []) {
      await admin.rpc('decrement_answer_upvotes', { answer_id_param: vote.answer_id });
    }
    check('delete answer votes', (await admin.from('answer_votes').delete().eq('user_id', userId)).error);

    // The user's own questions, with everything attached to them.
    const questions = await admin.from('questions').select('id').eq('user_id', userId);
    check('read questions', questions.error);
    const questionIds = (questions.data ?? []).map((q) => q.id as string);
    if (questionIds.length) {
      const answersOnThem = await admin.from('answers').select('id').in('question_id', questionIds);
      check('read answers on questions', answersOnThem.error);
      const answerIds = (answersOnThem.data ?? []).map((a) => a.id as string);
      if (answerIds.length) {
        check('delete votes on those answers', (await admin.from('answer_votes').delete().in('answer_id', answerIds)).error);
        check('delete answers on questions', (await admin.from('answers').delete().in('id', answerIds)).error);
      }
      check('delete votes on questions', (await admin.from('question_votes').delete().in('question_id', questionIds)).error);
      check('delete question bookmarks by others', (await admin.from('question_bookmarks').delete().in('question_id', questionIds)).error);
      check('delete questions', (await admin.from('questions').delete().in('id', questionIds)).error);
    }

    // The user's answers on other people's questions.
    const answers = await admin.from('answers').select('id, question_id').eq('user_id', userId);
    check('read answers', answers.error);
    const ownAnswerIds = (answers.data ?? []).map((a) => a.id as string);
    if (ownAnswerIds.length) {
      check('delete votes on answers', (await admin.from('answer_votes').delete().in('answer_id', ownAnswerIds)).error);
      check('delete answers', (await admin.from('answers').delete().in('id', ownAnswerIds)).error);
      for (const answer of answers.data ?? []) {
        await admin.rpc('decrement_answer_count', { question_id_param: answer.question_id });
      }
    }

    // Personal data (also removed by ON DELETE CASCADE where the table has it).
    for (const table of [
      'article_bookmarks',
      'question_bookmarks',
      'resource_bookmarks',
      'journey_entries',
      'journey_treatments',
      'journey_milestones',
      'journey_appointments',
      'reports',
      'self_check_progress',
    ]) {
      const { error } = await admin.from(table).delete().eq('user_id', userId);
      // A table this project hasn't created yet (before its migration is applied) has
      // nothing to delete.
      if (error && (error.code === '42P01' || error.code === 'PGRST205')) continue;
      check(`delete ${table}`, error);
    }

    // Profile picture (ignore "not found").
    await admin.storage.from('images').remove([`profile_pictures/profile_${userId}.jpg`]);

    check('delete auth user', (await admin.auth.admin.deleteUser(userId)).error);
    return jsonResponse({ deleted: true });
  } catch (error) {
    console.error('Account deletion failed', error);
    const message = error instanceof StepError ? error.message : 'Unexpected error';
    return jsonResponse({ error: `Account deletion failed (${message})` }, 500);
  }
});
