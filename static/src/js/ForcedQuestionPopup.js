odoo.define('point_forced_question.ForcedQuestionPopup', function(require) {
    'use strict';

    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
    const Registries = require('point_of_sale.Registries');

    class ForcedQuestionPopup extends AbstractAwaitablePopup {

		wk_add_question(event){
			var self = this;
			var question_id = parseInt($(event.target).data('id'));
			var all_checked_question = $('.wk_checked_question:checked');
			var question_list = [];
			all_checked_question.each(function(idx,element){
				question_list.push($(element).data('id'))
			})
			self.props.line.wk_question_ids = question_list;
			self.cancel();

		}
		wk_change_tab(event){
			var content_div_id = $(event.target).data('id');
			if(content_div_id){
				$('.tab-content').removeClass('current');
				$('.tab-link').removeClass('current');
				$(event.currentTarget).addClass('current');
				$(content_div_id).addClass('current');
			}
		}
		
		constructor(){
			super(...arguments);
			var self=this;
			if (self.props.product)
				self.props.image_url = self.wk_get_product_image_url(self.props.product);
		}
		wk_get_product_image_url(product){
			return window.location.origin + '/web/image?model=product.product&field=image_128&id='+product.id;
		}
    }
    ForcedQuestionPopup.template = 'ForcedQuestionPopup';
    ForcedQuestionPopup.defaultProps = {
        title: 'Confirm ?',
        value:''
    };

    Registries.Component.add(ForcedQuestionPopup);


    return ForcedQuestionPopup;
});