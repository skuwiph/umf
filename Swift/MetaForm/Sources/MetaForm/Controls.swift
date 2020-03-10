//
//  Controls.swift
//  
//
//  Created by Ian Seckington on 09/03/2020.
//

import Foundation

class MFControl {
    var controlType: MetaFormControlType
    var controlId: String
    var name: String
    var autoComplete: String?
    
    // Optional label for certain controls
    var label: String?
    
    var validators: [MFValidator]?
    var validatorsAsync: [MFValidatorAsync]?
    
    // Internal usage
    var isReferencedBy: [String]?
    var references: [String]?
    var dependencies: [String]?
    
    var readonly = false
    
    var inError = false
    var errorMessage: String?
    
    init(parent: MFQuestion, controlType: MetaFormControlType, name: String) {
        self.name = name
        self.controlType = controlType
        self.controlId = "\(parent.name):\(name)"
    }
    
    func isValid(form: MetaForm, updateStatus: Bool = true) -> Bool {
        var valid = true
        
        if (self.validators != nil) {
            for v in self.validators! {
                if !v.isValid(form: form, control: self) {
                    valid = false
                    self.errorMessage = v.message
                    
                    break
                }
            }
        }
        
        return valid
    }
}

class MFLabel: MFControl {
    var text: String
    
    init(parent: MFQuestion, name: String, text: String) {
        self.text = text
        super.init(parent: parent, controlType: MetaFormControlType.Label, name: name)
    }

    override func isValid(form: MetaForm, updateStatus: Bool = true) -> Bool {
        return true;
    }
}

class MFHtmlTextControl: MFControl {
    var html: String;

    init(parent: MFQuestion, name: String, html: String) {
        self.html = html
        super.init(parent: parent, controlType: MetaFormControlType.Html, name: name)
    }

    override func isValid(form: MetaForm, updateStatus: Bool = true) -> Bool {
        return true;
    }
}

class MFTextControl: MFControl {
    var textType: MetaFormTextType;
    var maxLength: Int
    var placeholder: String?

    init(parent: MFQuestion, name: String, textType: MetaFormTextType, maxLength: Int? = 0, placeholder: String?) {
        self.textType = textType
        self.maxLength = maxLength ?? 0
        self.placeholder = placeholder
        super.init(parent: parent, controlType: MetaFormControlType.Html, name: name)
    }
}

class MFOptionControlBase: MFControl {
    var options: [MFOptions]
    var optionLayout: ControlLayoutStyle = ControlLayoutStyle.Vertical

    init(parent: MFQuestion, name: String, controlType: MetaFormControlType, options: [MFOptions], optionLayout: ControlLayoutStyle) {
        self.options = options
        self.optionLayout = optionLayout
        super.init(parent: parent, controlType: controlType, name: name )
    }
}

class MFOptionControl: MFOptionControlBase {
    
}

class MFOptionMultiControl: MFOptionControlBase {
    
}

class MFDateControl: MFControl {
    var dateType: MetaFormDateType

    init(parent: MFQuestion, name: String, dateType: MetaFormDateType) {
        self.dateType = dateType
        super.init(parent: parent, controlType: MetaFormControlType.Date, name: name )
    }

    func getDay(form: MetaForm) -> String {
        if let value = form.getValue(self.name) {
            
        }
    }
}

struct MFOptions {
    var list: [MFOptionValue]?
    var optionSource: MFOptionSource?
    var emptyItem: String?
    var expandOptions: Bool = true
    
    static func OptionFromList(options: [MFOptionValue], emptyItem: String?, expandOptions: Bool = false) -> MFOptions{
        let o = MFOptions(list: options, emptyItem: emptyItem, expandOptions: expandOptions)
        return o;
    }

    static func OptionFromUrl(url: String, emptyItem: String?, expandOptions: Bool = false) -> MFOptions {
        let os = MFOptionSource(url: url)
        
        let o = MFOptions(list: nil, optionSource: os, emptyItem: emptyItem, expandOptions: expandOptions)

        return o;
    }    
}

struct MFOptionSource {
    var url: String
}

struct MFOptionValue {
    var code: String
    var description: String
}
