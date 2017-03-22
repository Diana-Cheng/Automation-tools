var gulp = require('gulp');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var named = require('vinyl-named');//该插件保证webpack生成的文件名能够和原文件对上
var uglify = require('gulp-uglify');//压缩js
var rename = require('gulp-rename');
var cssmin = require('gulp-clean-css');
var changed = require('gulp-changed');//只传输更改的文件
var debug = require('gulp-debug');
var imagemin = require('gulp-imagemin');//压缩图片

gulp.task('html',function(){
	return gulp.src('./src/*.html')
	.pipe(changed('./goal/*.html'))
	.pipe(debug())
	.pipe(gulp.dest('./goal'))
});

gulp.task('css',function(){
	return gulp.src('./src/css/*.css')
	.pipe(changed('./goal/css',{extension:'.css'}))
	.pipe(rename({suffix:'.min'}))
	.pipe(cssmin())
	.pipe(debug())
	.pipe(gulp.dest('./goal/css'))
});
// js代码使用webpack打包
gulp.task('scripts',function(){
	return gulp.src('./src/js/*.js')
	.pipe(named())
	.pipe(webpackStream(config))//webpack的配置
	.pipe(rename({suffix:'.min'}))
	.pipe(uglify())
	.pipe(debug())
	.pipe(gulp.dest('./goal/js'))
});

gulp.task('images',function(){
	return gulp.src('./src/images/*')
	.pipe(imagemin())
	.pipe(debug())
	.pipe(gulp.dest('./goal/images'))
});

gulp.task('watch',function(){
	gulp.watch('./src/css/*.css',['css']);
	gulp.watch('./src/*.html',['html']);
});

gulp.task('default',['html','css','scripts','images']);

// webpack的配置
var config = {
	module:{
		loaders:[
			{test:/\.css$/, loader:'css-loader'},
			{test:/\.vue$/, loader:'vue-loader'},
			{
				test:/\.(png|jpg|gif|svg|ico)$/,
				loader:'file-loader',
				query:{
					limit:50000,//小于50k自动压缩成base64编码的图片
					name:'./images/[name].[ext]'
				}
			}
		]
	},
	resolve:{
		alias:{//模块被其他模块名和路径替代
			'vue':'vue/goal/vue.common.js'
		}
	},
	plugins:[//插件
		new webpack.DefinePlugin({
			// 全局
			'process.env':{
				NODE_ENV:'"production'
			}
		}),
		// 提取公共代码块
		new webpack.optimize.CommonsChunkPlugin({
			name:'common'
		})
	],
	watch:true
}