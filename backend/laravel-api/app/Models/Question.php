<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'country_id',
        'category_id',
        'title',
        'content',
        'tags',
        'status',
        'views',
        'upvotes',
        'downvotes',
    ];

    protected $casts = [
        'tags' => 'array',
        'views' => 'integer',
        'upvotes' => 'integer',
        'downvotes' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function answers()
    {
        return $this->hasMany(Answer::class)->orderBy('is_accepted', 'desc')->orderBy('upvotes', 'desc');
    }
}

