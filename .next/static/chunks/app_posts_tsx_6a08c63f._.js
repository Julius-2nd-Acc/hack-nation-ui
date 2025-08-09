(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/app/posts.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>Posts
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$trpc$2f$trpc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/trpc/trpc.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function Posts() {
    _s();
    const utils = __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$trpc$2f$trpc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trpc"].useUtils();
    const { data: posts, isLoading } = __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$trpc$2f$trpc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trpc"].getPosts.useQuery();
    const addPost = __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$trpc$2f$trpc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trpc"].addPost.useMutation({
        onSuccess: {
            "Posts.useMutation[addPost]": ()=>utils.getPosts.invalidate()
        }["Posts.useMutation[addPost]"]
    });
    const removePost = __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$trpc$2f$trpc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trpc"].removePost.useMutation({
        onSuccess: {
            "Posts.useMutation[removePost]": ()=>utils.getPosts.invalidate()
        }["Posts.useMutation[removePost]"]
    });
    const [title, setTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [content, setContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [authorId, setAuthorId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const handleAdd = (e)=>{
        e.preventDefault();
        if (!title || !authorId) return;
        addPost.mutate({
            title,
            content,
            authorId
        });
        setTitle("");
        setContent("");
        setAuthorId("");
    };
    if (isLoading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: "Loading..."
    }, void 0, false, {
        fileName: "[project]/app/posts.tsx",
        lineNumber: 28,
        columnNumber: 27
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                children: "Posts"
            }, void 0, false, {
                fileName: "[project]/app/posts.tsx",
                lineNumber: 32,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleAdd,
                style: {
                    marginBottom: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        placeholder: "Title",
                        value: title,
                        onChange: (e)=>setTitle(e.target.value),
                        required: true
                    }, void 0, false, {
                        fileName: "[project]/app/posts.tsx",
                        lineNumber: 34,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        placeholder: "Content",
                        value: content,
                        onChange: (e)=>setContent(e.target.value)
                    }, void 0, false, {
                        fileName: "[project]/app/posts.tsx",
                        lineNumber: 40,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        placeholder: "Author ID",
                        value: authorId,
                        onChange: (e)=>setAuthorId(e.target.value),
                        required: true
                    }, void 0, false, {
                        fileName: "[project]/app/posts.tsx",
                        lineNumber: 45,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        disabled: addPost.isPending,
                        children: "Add Post"
                    }, void 0, false, {
                        fileName: "[project]/app/posts.tsx",
                        lineNumber: 51,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/posts.tsx",
                lineNumber: 33,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                children: posts === null || posts === void 0 ? void 0 : posts.map((post)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: post.title
                            }, void 0, false, {
                                fileName: "[project]/app/posts.tsx",
                                lineNumber: 56,
                                columnNumber: 25
                            }, this),
                            " by ",
                            post.authorId,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>removePost.mutate({
                                        id: post.id
                                    }),
                                disabled: removePost.isPending,
                                style: {
                                    marginLeft: 8
                                },
                                children: "Remove"
                            }, void 0, false, {
                                fileName: "[project]/app/posts.tsx",
                                lineNumber: 57,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: post.content
                            }, void 0, false, {
                                fileName: "[project]/app/posts.tsx",
                                lineNumber: 60,
                                columnNumber: 25
                            }, this)
                        ]
                    }, post.id, true, {
                        fileName: "[project]/app/posts.tsx",
                        lineNumber: 55,
                        columnNumber: 21
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/posts.tsx",
                lineNumber: 53,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/posts.tsx",
        lineNumber: 31,
        columnNumber: 9
    }, this);
}
_s(Posts, "/bG4xkCkfT46/nP0eMMZiXZKD8A=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$trpc$2f$trpc$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trpc"].useUtils
    ];
});
_c = Posts;
var _c;
__turbopack_context__.k.register(_c, "Posts");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=app_posts_tsx_6a08c63f._.js.map