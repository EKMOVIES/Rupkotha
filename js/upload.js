// js/upload.js

import { supabase, CLOUDINARY_CLOUD_NAME } from './config.js';

// ✅ আপনার Upload Preset নাম ব্যবহার করুন
const UPLOAD_PRESET = 'rupkotha_preset'; // আপনি যে নাম দিয়েছেন

// Cloudinary-এ ইমেজ আপলোড করার ফাংশন
export async function uploadImageToCloudinary(file) {
    try {
        // ফাইল সাইজ চেক (ম্যাক্স 10MB)
        if (file.size > 10 * 1024 * 1024) {
            throw new Error('ইমেজের সাইজ 10MB এর বেশি হতে পারবে না!');
        }

        // অনুমোদিত ফাইল টাইপ চেক
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('শুধু JPG, PNG, WebP এবং GIF ফাইল আপলোড করা যাবে!');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET); // আপনার Preset Name
        
        // অপশনাল: ফোল্ডার স্পেসিফাই (যদিও প্রিসেটে already আছে)
        // formData.append('folder', 'rupkotha/products');

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'ইমেজ আপলোড করতে ব্যর্থ!');
        }

        const data = await response.json();
        
        // ✅ সাফল্যের সাথে আপলোড হয়েছে
        console.log('✅ Image uploaded successfully:', {
            url: data.secure_url,
            public_id: data.public_id,
            folder: data.folder,
            display_name: data.display_name || data.original_filename
        });

        return {
            url: data.secure_url,
            public_id: data.public_id,
            folder: data.folder,
            display_name: data.display_name || data.original_filename
        };

    } catch (error) {
        console.error('❌ Upload error:', error);
        throw error;
    }
}

// প্রোডাক্ট ইমেজ আপলোড ও Supabase-এ সেভ (সহজ ভার্সন)
export async function addProductWithImage(productData, imageFile) {
    try {
        // ১. ইমেজ আপলোড
        const uploadResult = await uploadImageToCloudinary(imageFile);
        
        // ২. প্রোডাক্ট ডেটা তৈরি
        const newProduct = {
            name: productData.name,
            description: productData.description,
            price: parseFloat(productData.price),
            category: productData.category,
            image_url: uploadResult.url, // Cloudinary URL
            stock: parseInt(productData.stock) || 10,
            featured: productData.featured || false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // ৩. Supabase-এ সেভ
        const { data, error } = await supabase
            .from('products')
            .insert([newProduct])
            .select();
        
        if (error) throw error;
        
        console.log('✅ Product saved:', data[0]);
        return data[0];
        
    } catch (error) {
        console.error('❌ Error adding product:', error);
        throw error;
    }
}

// একাধিক ইমেজ আপলোড
export async function uploadMultipleImages(files) {
    const uploadPromises = files.map(file => uploadImageToCloudinary(file));
    const results = await Promise.all(uploadPromises);
    return results.map(r => r.url);
}

// ইমেজ ডিলিট করুন (অপশনাল)
export async function deleteImageFromCloudinary(publicId) {
    // নোট: Public ID দরকার, যা upload এর সময় পাওয়া যায়
    // এই ফাংশনটি সার্ভার সাইডে ব্যবহার করা ভালো
    console.log('Delete image:', publicId);
    // Cloudinary ডিলিট API কল করতে হবে
}

// প্রোডাক্ট ডিলিট (ইমেজ সহ)
export async function deleteProductWithImage(productId) {
    try {
        // ১. প্রথমে প্রোডাক্টের ডেটা পান
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('image_url')
            .eq('id', productId)
            .single();
        
        if (fetchError) throw fetchError;
        
        // ২. প্রোডাক্ট ডিলিট
        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);
        
        if (deleteError) throw deleteError;
        
        // ৩. (অপশনাল) Cloudinary থেকে ইমেজ ডিলিট
        // public_id বের করতে হবে Cloudinary URL থেকে
        
        console.log('✅ Product deleted');
        return true;
        
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        throw error;
    }
}