/* Copyright (c) 2016-Present Webkul Software Pvt. Ltd. (<https://webkul.com/>) */
/* See LICENSE file for full copyright and licensing details. */
/* License URL : <https://store.webkul.com/license.html/> */
odoo.define('pos_forced_question.pos_forced_question', function(require) {
	"use strict";
	var models = require('point_of_sale.models');
	var core = require('web.core');
	var _t = core._t;
	var SuperOrder = models.Order;
	const { Gui } = require('point_of_sale.Gui');
	var SuperOrderline = models.Orderline;
	var QWeb = core.qweb;
		
    const Orderline = require('point_of_sale.Orderline');
    const { useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');

	models.load_models([{
		model:'forced.question.group',
		field: [],
		domain:[],
		loaded: function(self,result) {
			self.db.question_group_by_id = {};
			result.forEach(element => {
				self.db.question_group_by_id[element.id] = element;
			});
		}

	},
	{
		model:'pos.forced.question',
		field: [],
		domain:[],
		loaded: function(self,result) {
			self.db.question_by_id = {};
			result.forEach(element => {
				self.db.question_by_id[element.id] = element;
			});
		}
	}]);
	models.load_fields('product.product','question_group_ids');
	

	models.Order = models.Order.extend({
		add_product: function(product, options){
			var self = this;
			var last_orderline = self.get_last_orderline();
			SuperOrder.prototype.add_product.call(self,product, options);
			var updated_last_orderline = self.get_last_orderline();
			if (product.question_group_ids  && product.question_group_ids.length && !(last_orderline && last_orderline.cid == updated_last_orderline.cid))
				Gui.showPopup('ForcedQuestionPopup',{
					groups:product.question_group_ids,
					product:product,
					line:updated_last_orderline,
				});
		}
	});
	models.Orderline = models.Orderline.extend({
		initialize: function(attr,options){
			var self = this;
			self.wk_question_ids = [];
			self.is_extra_price_set = false;
			self.forced_questions = '';
			SuperOrderline.prototype.initialize.call(self,attr,options);			
		},
		export_for_printing: function(){
			var dict = SuperOrderline.prototype.export_for_printing.call(this);
			dict.wk_question_ids = this.wk_question_ids;
			return dict;
		},
		get_orderline_questions: function(){
			var self = this;
			var question_text = '';
			if(self.wk_question_ids){
				self.wk_question_ids.forEach(function(question_id){
					question_text = question_text + self.pos.db.question_by_id[question_id].name + '\n';
				})
			}	
			return question_text;
		},
		export_as_JSON: function() {
			var self = this;
			var loaded=SuperOrderline.prototype.export_as_JSON.call(this);
			loaded.forced_questions=self.get_orderline_questions();
			loaded.wk_question_ids = self.wk_question_ids;
			return loaded;
		},
		init_from_JSON: function(json) {
			SuperOrderline.prototype.init_from_JSON.call(this,json);
			if(json && json.wk_question_ids){
				this.wk_question_ids = json.wk_question_ids;
			}
			if(json && json.is_extra_price_set){
				this.is_extra_price_set = json.is_extra_price_set;
			}
		}
		
	});


    const PosResOrderline = (Orderline) =>
        class extends Orderline {
			open_force_popup(orderline){
				var self = this;
				self.showPopup('ForcedQuestionPopup',{
					groups:orderline.product.question_group_ids,
					product:orderline.product,
					line:orderline,
				});

			}
		}

	Registries.Component.extend(Orderline, PosResOrderline);

	return Orderline;

});
