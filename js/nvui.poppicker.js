/**
 * 弹出选择列表插件
 */

(function($, document) {

	var panelBuffer = '<div class="nvui-poppicker">\
		<div class="nvui-poppicker-header">\
			<button class="nvui-btn nvui-poppicker-btn-cancel">取消</button>\
			<button class="nvui-btn nvui-btn-blue nvui-poppicker-btn-ok">确定</button>\
			<div class="nvui-poppicker-clear"></div>\
		</div>\
		<div class="nvui-poppicker-body">\
		</div>\
	</div>';

	var pickerBuffer = '<div class="nvui-listpicker">\
		<div class="nvui-listpicker-inner">\
			<ul>\
			</ul>\
		</div>\
	</div>';

	//定义弹出选择器类
	var PopPicker = $.PopPicker = $.Class.extend({
		//构造函数
		init: function(options) {
			var self = this;
			self.options = options || {};
			self.options.buttons = self.options.buttons || ['取消', '确定'];
			self.panel = $.dom(panelBuffer)[0];
			document.body.appendChild(self.panel);
			self.ok = self.panel.querySelector('.nvui-poppicker-btn-ok');
			self.cancel = self.panel.querySelector('.nvui-poppicker-btn-cancel');
			self.body = self.panel.querySelector('.nvui-poppicker-body');
			self.mask = $.createMask();
			self.cancel.innerText = self.options.buttons[0];
			self.ok.innerText = self.options.buttons[1];
			self.cancel.addEventListener('tap', function(event) {
				self.hide();
			}, false);
			self.ok.addEventListener('tap', function(event) {
				if (self.callback) {
					var rs = self.callback(self.getSelectedItems());
					if (rs !== false) {
						self.hide();
					}
				}
			}, false);
			self.mask[0].addEventListener('tap', function() {
				self.hide();
			}, false);
			self._createListPicker();
		},
		_createListPicker: function() {
			var self = this;
			var layer = self.options.layer || 1;
			var width = (100 / layer) + '%';
			self.pickers = [];
			for (var i = 1; i <= layer; i++) {
				var picker = $.dom(pickerBuffer)[0];
				picker.style.width = width;
				self.body.appendChild(picker);
				$(picker).listpicker();
				self.pickers.push(picker);
				picker.addEventListener('change', function(event) {
					var nextPicker = this.nextSibling;
					if (nextPicker && nextPicker.listpickerId) {
						var eventData = event.detail || {};
						var preItem = eventData.item || {};
						nextPicker.setItems(preItem.children);
					}
				}, false);
			}
		},
		//填充数据
		setData: function(data) {
			var self = this;
			data = data || [];
			self.pickers[0].setItems(data);
		},
		//获取选中的项（数组）
		getSelectedItems: function() {
			var self = this;
			var items = [];
			for (var i in self.pickers) {
				var picker = self.pickers[i];
				items.push(picker.getSelectedItem() || {});
			}
			return items;
		},
		//显示
		show: function(callback) {
			var self = this;
			self.callback = callback;
			self.mask.show();
			document.body.classList.add($.className('poppicker-active-for-page'));
			self.panel.classList.add($.className('active'));
		},
		//隐藏
		hide: function() {
			var self = this;
			if (self.disposed) return;
			self.panel.classList.remove($.className('active'));
			self.mask.close();
			document.body.classList.remove($.className('poppicker-active-for-page'));
		},
		dispose: function() {
			var self = this;
			self.hide();
			setTimeout(function() {
				self.panel.parentNode.removeChild(self.panel);
				for (var name in self) {
					self[name] = null;
					delete self[name];
				};
				self.disposed = true;
			}, 300);
		}
	});

})(nvui, document);