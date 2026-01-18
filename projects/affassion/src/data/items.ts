export interface Item {
    id: string;
    name: string;
    price: string;
    image: string;
    category: string;
    description?: string;
    sheinUrl?: string;
}

export const items: Item[] = [
    {
        id: "pickup-1",
        name: "Polyresin Flower Vase (White/Minimal)",
        price: "¥850",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAQrCAkpRlxp2iCIIKaEq8q6xPXt38UIzLdSSUA_XR-79MRFi2u0_Zh1K_YQLEHWnm8PtQFbVp2jhTbBywyu9tgCwJZtS2QuYV5QzKduXBldizYtv12aT5KvyhtBuM430eIrCbwRa45ZCaeGFegGd360YKrarJlMYVkXN5LYZFRJjl7HYTViwFS2DyQC1oZVokxn21p6PKs5jaj_Ghq9eJRNlvxY7OnKQrF8F8PcDGasfWz_cenfC_mq9Qz8W7cXqpngWV0_SANQnRF",
        category: "interior",
        description: "シンプルなマット質感の樹脂製花瓶。韓国インテリアの定番。",
        sheinUrl: "https://us.shein.com/pdsearch/polyresin%20vase",
    },
    {
        id: "pickup-2",
        name: "Mini Strawberry Vase",
        price: "¥450",
        image:
            "https://plus.unsplash.com/premium_photo-1694500628292-6f296d9dc703?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "interior",
        description: "SNSで話題のイチゴ型花瓶。ポップなアクセントに。",
        sheinUrl: "https://us.shein.com/pdsearch/strawberry%20vase",
    },
    {
        id: "article-1",
        name: "Modern Geometric Striped Plastic Vase",
        price: "¥320",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuArg1tOoSSuc_L5XVmsno_KLA8qXLK__S3TfhpB61O76CJImOk5KDOh2r9bvFYxqgH_PfLmrHruGg-diOotiJ8nPER0sTiqR5IexPuUrSbkxPuLvu0S1PpYH-Moe7Mq3DTGxOuEUq-uigR3747NOi106RgUbqBhLP2aadpNQWOzDdhBn1fbCila7Bsj16ZtuaWFaf3a2zl-tWEQkMQizct3AvQ0RACitB8JXsfLK4K5TR27c4WkqXr2KBFCgqnCEN_9tS1sH3DQ3ZRb",
        category: "architecture",
        description: "北欧風の幾何学ラインが入った軽量花瓶。",
        sheinUrl: "https://us.shein.com/pdsearch/geometric%20vase",
    },
    {
        id: "article-2",
        name: "Bohemian Style Bow Vase",
        price: "¥1,200",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuC1OUPSr9UyKwwCcY-jsrzvzvbSjI4mY4lpVur8KOJt_eXfpZDkGnzRD8ppZnXuhrkoOGHdCRvHknZFztICcRtpKapDXVqXJwVF80oXXO-G0-U5fjd7Pq4BJMe4fLxb1gKPn4MxCRTdoaR8vu9reueyltJpzaeV5gIr5yoBXyEWQiHTbAt_u0cXPJOfR1bhNOmfuFwRb_I_UVLZ3hf8PESf_3XB0ZmSnUpJGxJtF4kmgtKxAi9yrh4zPwzwXjCTSSCOyK1LDPwmtA7n",
        category: "style",
        description: "リボンがあしらわれたガーリーかつ上品なデザイン。",
        sheinUrl: "https://us.shein.com/pdsearch/bow%20vase",
    },
    {
        id: "collection-1",
        name: "Pleated Ceramic Table Lamp",
        price: "¥2,500",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCv3N51lY2MpIDkJff95aeBs3i6t6DZJozw4QebLQThMemNcVrCFu44mPCpLa5ciL6oOWtkG-kfkOAFX-L2zRS4_1jxV45r9obOKww2SkF66Qu7xRs3ZCGGRbm4y923rSdji4uaX0FZriD2xnK5kyLRil7NVqLqa7gGlW0l2tOLRTm8LOICmaeCgk_SvW4J9GLp_R4Uy_4be66jIzEOxXn5Ytt9QkbhSW0sCDImNbkIaBGScvbOeHI8T2SJT2Yrm1Xr7VEDukhATMQf",
        category: "collection",
        description: "プリーツシェードのテーブルランプ。淡い光が特徴。",
        sheinUrl: "https://us.shein.com/pdsearch/pleated%20lamp",
    },
    {
        id: "collection-2",
        name: "Decorative Art Mirror (Irregular/Bean)",
        price: "¥600",
        image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuC1OUPSr9UyKwwCcY-jsrzvzvbSjI4mY4lpVur8KOJt_eXfpZDkGnzRD8ppZnXuhrkoOGHdCRvHknZFztICcRtpKapDXVqXJwVF80oXXO-G0-U5fjd7Pq4BJMe4fLxb1gKPn4MxCRTdoaR8vu9reueyltJpzaeV5gIr5yoBXyEWQiHTbAt_u0cXPJOfR1bhNOmfuFwRb_I_UVLZ3hf8PESf_3XB0ZmSnUpJGxJtF4kmgtKxAi9yrh4zPwzwXjCTSSCOyK1LDPwmtA7n",
        category: "collection",
        description: "ビーンズ型の変形ミラー。壁掛け・卓上両用。",
        sheinUrl: "https://us.shein.com/pdsearch/irregular%20mirror",
    },
];

export const getItemsByCategory = (category: string) => {
    if (category === "all") return items;
    return items.filter((item) => item.category === category);
};

export const getItemById = (id: string) => {
    return items.find((item) => item.id === id);
};
