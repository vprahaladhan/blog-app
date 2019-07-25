const dummy = blogs => {
    return 1
}

const totalLikes = blogs => {
    return blogs.reduce((total, blog) => total + blog.likes, 0)
}

const favoriteBlog = blogs => {
    const favBlog = {
        likes: 0,
    }

    const mostLikedBlog = blogs.reduce((total, blog) => {
        console.log(total.likes, blog.likes)
        return blog.likes > total.likes ? blog : total
    }, favBlog)
    
    return {
        title: mostLikedBlog.title,
        author: mostLikedBlog.author,
        likes: mostLikedBlog.likes
    }
}

module.exports = {
    dummy, totalLikes, favoriteBlog
}