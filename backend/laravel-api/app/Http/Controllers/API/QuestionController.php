<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class QuestionController extends Controller
{
    /**
     * Get all questions with filters
     */
    public function index(Request $request)
    {
        $query = Question::with(['user', 'country', 'category'])
            ->withCount('answers');

        // Filter by country
        if ($request->has('country_id')) {
            $query->where('country_id', $request->country_id);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $questions = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $questions->items(),
            'pagination' => [
                'current_page' => $questions->currentPage(),
                'last_page' => $questions->lastPage(),
                'per_page' => $questions->perPage(),
                'total' => $questions->total(),
            ]
        ]);
    }

    /**
     * Get single question
     */
    public function show($id)
    {
        $question = Question::with(['user', 'country', 'category', 'answers.user'])
            ->withCount('answers')
            ->find($id);

        if (!$question) {
            return response()->json([
                'success' => false,
                'message' => 'Question not found'
            ], 404);
        }

        // Increment views
        $question->increment('views');

        return response()->json([
            'success' => true,
            'data' => $question
        ]);
    }

    /**
     * Create question
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'country_id' => 'nullable|exists:countries,id',
            'category_id' => 'nullable|exists:categories,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $question = Question::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'content' => $request->content,
            'country_id' => $request->country_id,
            'category_id' => $request->category_id,
            'tags' => $request->tags ?? [],
            'status' => 'open',
        ]);

        // Add reputation points for asking
        $user = $request->user();
        $user->increment('reputation', 5);
        $this->updateUserLevel($user);

        return response()->json([
            'success' => true,
            'message' => 'Question posted! You earned 5 reputation points.',
            'data' => $question->load(['user', 'country', 'category'])
        ], 201);
    }

    /**
     * Update question
     */
    public function update(Request $request, $id)
    {
        $question = Question::find($id);

        if (!$question) {
            return response()->json([
                'success' => false,
                'message' => 'Question not found'
            ], 404);
        }

        // Check ownership (unless admin)
        if ($question->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'country_id' => 'nullable|exists:countries,id',
            'category_id' => 'nullable|exists:categories,id',
            'tags' => 'nullable|array',
            'status' => 'sometimes|in:open,answered,closed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $question->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Question updated',
            'data' => $question->load(['user', 'country', 'category'])
        ]);
    }

    /**
     * Delete question
     */
    public function destroy(Request $request, $id)
    {
        $question = Question::find($id);

        if (!$question) {
            return response()->json([
                'success' => false,
                'message' => 'Question not found'
            ], 404);
        }

        // Check ownership (unless admin)
        if ($question->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $question->delete();

        return response()->json([
            'success' => true,
            'message' => 'Question deleted'
        ]);
    }

    /**
     * Upvote question
     */
    public function upvote(Request $request, $id)
    {
        $question = Question::find($id);

        if (!$question) {
            return response()->json([
                'success' => false,
                'message' => 'Question not found'
            ], 404);
        }

        $question->increment('upvotes');

        // Add reputation to question owner
        $owner = User::find($question->user_id);
        if ($owner) {
            $owner->increment('reputation', 2);
            $this->updateUserLevel($owner);
        }

        return response()->json([
            'success' => true,
            'message' => 'Upvoted',
            'data' => ['upvotes' => $question->fresh()->upvotes]
        ]);
    }

    /**
     * Downvote question
     */
    public function downvote(Request $request, $id)
    {
        $question = Question::find($id);

        if (!$question) {
            return response()->json([
                'success' => false,
                'message' => 'Question not found'
            ], 404);
        }

        $question->increment('downvotes');

        return response()->json([
            'success' => true,
            'message' => 'Downvoted',
            'data' => ['downvotes' => $question->fresh()->downvotes]
        ]);
    }

    /**
     * Update user level based on reputation
     */
    private function updateUserLevel(User $user)
    {
        if ($user->reputation >= 1000) {
            $user->update(['level' => 'expert']);
        } elseif ($user->reputation >= 100) {
            $user->update(['level' => 'intermediate']);
        }
    }
}

